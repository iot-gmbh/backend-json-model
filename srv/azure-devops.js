const azdev = require("azure-devops-node-api");

const orgUrl = "https://dev.azure.com/iot-gmbh";

require("dotenv").config();

const token = process.env.AZURE_PERSONAL_ACCESS_TOKEN;

const authHandler = azdev.getPersonalAccessTokenHandler(token);
const connection = new azdev.WebApi(orgUrl, authHandler);
const AzDevProject = "IOT Projekte";

const MAP_DEVOPS_TO_CDS_NAMES = {
  ID: "id",
  assignedTo: "[System.AssignedTo]",
  assignedTo_userPrincipalName: "[System.AssignedTo]",
  changedDate: "System.ChangedDate",
  createdDate: "System.CreatedDate",
  reason: "System.Reason",
  state: "System.State",
  teamProject: "System.TeamProject",
  title: "System.Title",
  workItemType: "System.WorkItemType",
  // Documentation
  activatedDate: "[Microsoft.VSTS.Common.ActivatedDate]",
  resolvedDate: "[Microsoft.VSTS.Common.ResolvedDate]",
  closedDate: "[Microsoft.VSTS.Common.ClosedDate]",
  completedDate: "[Microsoft.VSTS.Common.ClosedDate]",
  // Scheduling
  completedWork: "Microsoft.VSTS.Scheduling.CompletedWork",
  remainingWork: "Microsoft.VSTS.Scheduling.RemainingWork",
  originalEstimate: "Microsoft.VSTS.Scheduling.OriginalEstimate",
  // Custom
  ticket: "Custom.Ticket",
  customer_friendlyID: "Custom.Kunde",
  project_friendlyID: "Custom.Projekt",
};

function destructureDevOpsObj(devOpsObj) {
  const cds = {};
  ({
    id: cds.ID,
    "System.AssignedTo": { uniqueName: cds.assignedTo_userPrincipalName },
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
    // Custom
    "Custom.Ticket": cds.ticket,
    "Custom.Kunde": cds.customer_friendlyID,
    "Custom.Projekt": cds.project_friendlyID,
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

function isISODate(str) {
  // Regex-Source: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  const dateRegexp =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

  return dateRegexp.test(str);
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

  return `AND${whereClause}`;
}

function getDevOpsFieldName(CDSName) {
  return MAP_DEVOPS_TO_CDS_NAMES[CDSName];
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

module.exports = cds.service.impl(async function () {
  async function readWorkItems({ req, restrictToOwnUser }) {
    const workItemAPI = await connection.getWorkItemTrackingApi();

    let SQLString = "";
    try {
      const { SelectBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");
      const selectBuilder = new SelectBuilder(req.query);
      SQLString = selectBuilder.build();
    } catch (error) {
      return [];
      // whereClause = `[System.Id] = '${req.data.ID}'`;
    }

    const whereClause = getWhereClause(SQLString);
    const whereClauseFilterByAssignedTo = restrictToOwnUser
      ? `${whereClause} AND assignedTo = '${req.user.id}'`
      : whereClause;
    const WIQLWhereClause = transformToWIQL(whereClauseFilterByAssignedTo);

    const workItemsByWIQL = await workItemAPI.queryByWiql({
      query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${AzDevProject}' AND [System.WorkItemType] <> '' ${WIQLWhereClause}`,
    });

    const IDs = workItemsByWIQL.workItems.map(({ id }) => id);
    const wiDetails = (await workItemAPI.getWorkItems(IDs)) || [];
    const results = wiDetails
      // Using map + reduce because flatMap is not supported by the NodeJS-version on BTP
      .map((item) => ({ id: item.id.toString(), ...item.fields }))
      .reduce((acc, item) => acc.concat(item), [])
      .filter((item) => !!item["Microsoft.VSTS.Common.ActivatedDate"])
      .map((DevOpsObject) => {
        const CDSObject = destructureDevOpsObj(DevOpsObject);

        Object.entries(CDSObject).forEach(([key, value]) => {
          if (isISODate(value)) {
            // Strip milliseconds: https://stackoverflow.com/questions/31171810/stripping-milliseconds-from-extended-iso-format
            CDSObject[key] = `${value.substring(0, 19)}Z`;
          }
        });

        CDSObject.completedDate =
          CDSObject.closedDate || CDSObject.resolvedDate;
        CDSObject.type = "WorkItem";
        return CDSObject;
      });

    // Adds the OData-inlinecount
    results.$count = results.length;
    return results;
  }

  this.on("READ", "WorkItems", (req) =>
    readWorkItems({ req, restrictToOwnUser: false })
  );
});
