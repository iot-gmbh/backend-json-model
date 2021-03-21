function getSubstringBetween(string, begin, end) {
  const substringBetween = string.substring(
    string.lastIndexOf(begin) + begin.length,
    string.lastIndexOf(end)
  );

  return substringBetween;
}

function getWhereClause({ sql, values }) {
  if (!sql || !sql.includes("WHERE")) return false;

  const genericWhereClause = getSubstringBetween(sql, "WHERE", "ORDER BY");

  const whereClause = values.reduce((string, value) => {
    return string.replace("?", `'${value}'`);
  }, genericWhereClause);

  return "AND" + whereClause;
}

function transformToWIQL(substring) {
  const substrings = substring.split(" ");

  const WIQL = substrings
    .filter((str) => str.length > 0)
    .reduce((str, substr) => {
      const next =
        substr.length > 3 &&
        !(substr === substr.toUpperCase()) &&
        !substr.startsWith("'")
          ? `[System.${substr}]`
          : substr;
      const result = str.concat(` ${next}`);
      return result;
    }, "");

  return WIQL;
}

function isISODate(str) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  var d = new Date(str);
  return d.toISOString() === str;
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

  const { Employees, Items, WorkItems } = this.entities;

  this.on("READ", WorkItems, async (req) => {
    const selectBuilder = new SelectBuilder(req.query);
    const SQLString = selectBuilder.build();

    const whereClause = getWhereClause(SQLString);

    if (!whereClause) {
      const results = [];
      results.$count = results.length;
      return results;
    }

    const WIQLWhereClause = transformToWIQL(whereClause);

    const workItemsByWIQL = await workItemAPI.queryByWiql({
      query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = 'IOT Projekte' AND [System.WorkItemType] <> ''${WIQLWhereClause}`,
    });

    const ids = workItemsByWIQL.workItems.map(({ id }) => id);
    const wiDetails = (await workItemAPI.getWorkItems(ids)) || [];
    const results = wiDetails
      .map((item) => ({ id: item.id, ...item.fields }))
      .reduce((acc, item) => acc.concat(item), [])
      .map((item) => ({
        ID: item.id,
        AssignedTo: item["System.AssignedTo"].uniqueName,
        AssignedToName: item["System.AssignedTo"].displayName,
        ChangedDate: item["System.ChangedDate"],
        CreatedDate: item["System.CreatedDate"],
        Reason: item["System.Reason"],
        State: item["System.State"],
        TeamProject: item["System.TeamProject"],
        Title: item["System.Title"],
        WorkItemType: item["System.WorkItemType"],
        // Documentation
        ActivatedDate: item["Microsoft.VSTS.Common.ActivatedDate"],
        ResolvedDate: item["Microsoft.VSTS.Common.ResolvedDate"],
        ClosedDate: item["Microsoft.VSTS.Common.ClosedDate"],
        // Scheduling
        CompletedWork: item["Microsoft.VSTS.Scheduling.CompletedWork"],
        RemainingWork: item["Microsoft.VSTS.Scheduling.RemainingWork"],
        OriginalEstimate: item["Microsoft.VSTS.Scheduling.OriginalEstimate"],
      }))
      .map((item) => {
        /* Azure DevOps gives us Datestrings with .456 Milliseconds. The Default Milliseconds for OData DateTimeOffset is 0:https://openui5.hana.ondemand.com/api/sap.ui.model.odata.type.DateTimeOffset#constructor.
        In order to avoid we do a manual transformation */
        for (let [key, value] of Object.entries(item)) {
          if (isISODate(value)) {
            item[key] = value.split(".")[0] + "Z";
          }
        }

        item.CompletedDate = item.ClosedDate || item.ResolvedDate;
        return item;
      });

    // const sortedByResolvedDay = results
    //   .filter(({ ResolvedDate }) => !!ResolvedDate)
    //   .sort((a, b) => (a.ResolvedDate <= b.ResolvedDate ? -1 : 1));

    //   sortedByResolvedDay.$count = sortedByResolvedDay.length;

    //   return sortedByResolvedDay;

    results.$count = results.length;
    return results;
  });
});
