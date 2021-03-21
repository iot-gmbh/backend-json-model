const MAP_DEVOPS_TO_CDS_NAMES = {
  ID: "id",
  AssignedTo: "System.AssignedTo",
  ChangedDate: "System.ChangedDate",
  CreatedDate: "System.CreatedDate",
  Reason: "System.Reason",
  State: "System.State",
  TeamProject: "System.TeamProject",
  Title: "System.Title",
  WorkItemType: "System.WorkItemType",
  // Documentation
  ActivatedDate: "Microsoft.VSTS.Common.ActivatedDate",
  ResolvedDate: "Microsoft.VSTS.Common.ResolvedDate",
  ClosedDate: "Microsoft.VSTS.Common.ClosedDate",
  // Scheduling
  CompletedWork: "Microsoft.VSTS.Scheduling.CompletedWork",
  RemainingWork: "Microsoft.VSTS.Scheduling.RemainingWork",
  OriginalEstimate: "Microsoft.VSTS.Scheduling.OriginalEstimate",
};

function destructureDevOpsObj(devOpsObj) {
  let cds = {};
  ({
    id: cds.ID,
    "System.AssignedTo": { uniqueName: cds.AssignedToUserID },
    "System.AssignedTo": { displayName: cds.AssignedToName },
    "System.ChangedDate": cds.ChangedDate,
    "System.CreatedDate": cds.CreatedDate,
    "System.Reason": cds.Reason,
    "System.State": cds.State,
    "System.TeamProject": cds.TeamProject,
    "System.Title": cds.Title,
    "System.WorkItemType": cds.WorkItemType,
    "Microsoft.VSTS.Common.ActivatedDate": cds.ActivatedDate,
    "Microsoft.VSTS.Common.ResolvedDate": cds.ResolvedDate,
    "Microsoft.VSTS.Common.ClosedDate": cds.ClosedDate,
    "Microsoft.VSTS.Scheduling.CompletedWork": cds.CompletedWork,
    "Microsoft.VSTS.Scheduling.RemainingWork": cds.RemainingWork,
    "Microsoft.VSTS.Scheduling.OriginalEstimate": cds.OriginalEstimate,
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

const azdev = require("azure-devops-node-api");
const { SelectBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");

require("dotenv").config();

const orgUrl = "https://dev.azure.com/iot-gmbh";
const token = process.env.AZURE_PERSONAL_ACCESS_TOKEN;
const authHandler = azdev.getPersonalAccessTokenHandler(token);

module.exports = cds.service.impl(async function () {
  const connection = new azdev.WebApi(orgUrl, authHandler);
  const workItemAPI = await connection.getWorkItemTrackingApi();

  this.on("READ", "MyWorkItems", async (req) => {
    const selectBuilder = new SelectBuilder(req.query);
    const SQLString = selectBuilder.build();
    const whereClause = getWhereClause(SQLString);

    // const whereClauseFilterByAssignedTo = `${whereClause} AND AssignedTo = ${req.user.id}`;
    const whereClauseFilterByAssignedTo = `${whereClause} AND AssignedTo = 'nick.obendorf@iot-online.de'`;

    const WIQLWhereClause = transformToWIQL(whereClauseFilterByAssignedTo);

    const workItemsByWIQL = await workItemAPI.queryByWiql({
      query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = 'IOT Projekte' AND [System.WorkItemType] <> '' ${WIQLWhereClause}`,
    });

    const ids = workItemsByWIQL.workItems.map(({ id }) => id);
    const wiDetails = (await workItemAPI.getWorkItems(ids)) || [];
    const results = wiDetails
      .map((item) => ({ id: item.id, ...item.fields }))
      .reduce((acc, item) => acc.concat(item), [])
      .map((DevOpsObject) => {
        let CDSObject = destructureDevOpsObj(DevOpsObject);

        for (let [key, value] of Object.entries(CDSObject)) {
          if (isISODate(value)) {
            // Strip milliseconds: https://stackoverflow.com/questions/31171810/stripping-milliseconds-from-extended-iso-format
            CDSObject[key] = value.substring(0, 19) + "Z";
          }
        }

        CDSObject.CompletedDate =
          CDSObject.ClosedDate || CDSObject.ResolvedDate;
        return CDSObject;
      });

    results.$count = results.length;
    return results;
  });
});
