const MAP_DEVOPS_TO_CDS_NAMES = {
  ID: "id",
  assignedTo: "System.AssignedTo",
  assignedTo_ID: "System.AssignedTo",
  changedDate: "System.ChangedDate",
  createdDate: "System.CreatedDate",
  reason: "System.Reason",
  state: "System.State",
  teamProject: "System.TeamProject",
  title: "System.Title",
  workItemType: "System.WorkItemType",
  // Documentation
  activatedDate: "Microsoft.VSTS.Common.ActivatedDate",
  resolvedDate: "Microsoft.VSTS.Common.ResolvedDate",
  closedDate: "Microsoft.VSTS.Common.ClosedDate",
  // Scheduling
  completedWork: "Microsoft.VSTS.Scheduling.CompletedWork",
  remainingWork: "Microsoft.VSTS.Scheduling.RemainingWork",
  originalEstimate: "Microsoft.VSTS.Scheduling.OriginalEstimate",
};

function destructureDevOpsObj(devOpsObj) {
  let cds = {};
  ({
    id: cds.ID,
    "System.AssignedTo": { uniqueName: cds.assignedTo_ID },
    "System.AssignedTo": { displayName: cds.assignedToName },
    "System.ChangedDate": cds.changedDate,
    "System.CreatedDate": cds.createdDate,
    "System.Reason": cds.reason,
    "System.State": cds.state,
    "System.TeamProject": cds.teamProject,
    "System.Title": cds.title,
    "System.WorkItemType": cds.workItemType,
    // Documentation
    "Microsoft.VSTS.Common.ActivatedDate": cds.activatedDate,
    "Microsoft.VSTS.Common.ResolvedDate": cds.resolvedDate,
    "Microsoft.VSTS.Common.ClosedDate": cds.closedDate,
    // Scheduling
    "Microsoft.VSTS.Scheduling.CompletedWork": cds.completedWork,
    "Microsoft.VSTS.Scheduling.RemainingWork": cds.remainingWork,
    "Microsoft.VSTS.Scheduling.OriginalEstimate": cds.originalEstimate,
  } = devOpsObj);
  return cds;
}

function getSubstringBetween(string, begin, end) {
  const substringBetween = string.substring(
    string.lastIndexOf(begin) + begin.length,
    string.lastIndexOf(end)
  );

  return substringBetween;
}

function getWhereClause({ sql, values }) {
  if (!sql || !sql.includes("WHERE")) return "";

  const genericWhereClause = getSubstringBetween(sql, "WHERE", "ORDER BY");

  const whereClause = values.reduce((string, value) => {
    let replace = value;

    if (isISODate(value)) {
      replace = replace.substring(0, 10);
    }

    return string.replace("?", `'${replace}'`);
  }, genericWhereClause);

  return "AND" + whereClause;
}

function transformToWIQL(substring) {
  const substrings = substring.split(" ");

  const WIQL = substrings
    .filter((str) => str.length > 0)
    .reduce((str, substr) => {
      const next = getDevOpsFieldName(substr) || substr;
      const result = str.concat(` ${next}`);
      return result;
    }, "");

  return WIQL;
}

function getDevOpsFieldName(CDSName) {
  return MAP_DEVOPS_TO_CDS_NAMES[CDSName];
}

function isISODate(str) {
  // Regex-Source: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  const dateRegexp = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

  return dateRegexp.test(str);
}

async function getWorkItemsFromDevOps({ req, restrictToOwnUser }) {
  const azdev = require("azure-devops-node-api");
  const orgUrl = "https://dev.azure.com/iot-gmbh";
  const token = process.env.AZURE_PERSONAL_ACCESS_TOKEN;
  const authHandler = azdev.getPersonalAccessTokenHandler(token);

  const connection = new azdev.WebApi(orgUrl, authHandler);
  const workItemAPI = await connection.getWorkItemTrackingApi();

  const { SelectBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");
  const selectBuilder = new SelectBuilder(req.query);
  const SQLString = selectBuilder.build();

  const whereClause = getWhereClause(SQLString);
  const whereClauseFilterByAssignedTo = restrictToOwnUser
    ? `${whereClause} AND assignedTo = '${req.user.id}'`
    : whereClause;
  const WIQLWhereClause = transformToWIQL(whereClauseFilterByAssignedTo);

  const workItemsByWIQL = await workItemAPI.queryByWiql({
    query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = 'IOT Projekte' AND [System.WorkItemType] <> '' ${WIQLWhereClause}`,
  });

  const ids = workItemsByWIQL.workItems.map(({ id }) => id);
  const wiDetails = (await workItemAPI.getWorkItems(ids)) || [];
  const results = wiDetails
    // Using map + reduce because flatMap is not supported by the NodeJS-version on BTP
    .map((item) => ({ id: item.id.toString(), ...item.fields }))
    .reduce((acc, item) => acc.concat(item), [])
    .map((DevOpsObject) => {
      let CDSObject = destructureDevOpsObj(DevOpsObject);

      for (let [key, value] of Object.entries(CDSObject)) {
        if (isISODate(value)) {
          // Strip milliseconds: https://stackoverflow.com/questions/31171810/stripping-milliseconds-from-extended-iso-format
          CDSObject[key] = value.substring(0, 19) + "Z";
        }
      }

      CDSObject.completedDate = CDSObject.closedDate || CDSObject.resolvedDate;
      CDSObject.type = "WorkItem";
      return CDSObject;
    });

  // Adds the OData-inlinecount
  results.$count = results.length;
  return results;
}

async function getEventsFromMSGraph(req) {
  const cdsapi = require("@sapmentors/cds-scp-api");
  const service = await cdsapi.connect.to("MicrosoftGraphIOTGmbH");
  const user = "benedikt.hoelker@iot-online.de";
  // const user = req.user.id;

  let events = [];
  try {
    const queryString = Object.entries(req._query)
      .filter(([key]) => !key.includes("$select"))
      .reduce(
        (str, [key, value], index) => str.concat("&", key, "=", value),
        // str.concat(index > 0 ? "&" : "", key, "=", value),
        "?$select=id,subject,start,end,categories,sensitivity"
      )
      // TODO: Replace with a better transformation
      .replace("activatedDate ge ", "start/dateTime ge '")
      .replace("Z", "Z'");

    const { value } = await service.run({
      url: `/v1.0/users/${user}/events${queryString}`,
    });

    events = value.map(
      ({ id, subject, start, end, categories: [customer], sensitivity }) => ({
        ID: id,
        title: subject,
        customer,
        activatedDate: start.dateTime.substring(0, 19) + "Z",
        completedDate: end.dateTime.substring(0, 19) + "Z",
        assignedTo_ID: user,
        private: sensitivity === "private",
        type: "Event",
      })
    );
  } catch (error) {
    console.log(error);
  }

  return events;
}

require("dotenv").config();

module.exports = cds.service.impl(async function () {
  this.on("READ", "MyWorkItems", async (req) => {
    const [...data] = await Promise.all([
      getWorkItemsFromDevOps({
        req,
        restrictToOwnUser: true,
      }),
      getEventsFromMSGraph(req),
    ]);

    const results = data.reduce((acc, item) => acc.concat(item), []);

    return results;
  });

  this.on("READ", "WorkItems", async (req) =>
    getWorkItemsFromDevOps({ req, restrictToOwnUser: false })
  );
});
