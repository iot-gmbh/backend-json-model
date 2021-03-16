module.exports = cds.service.impl(async function () {
  const azdev = require("azure-devops-node-api");
  const { SelectBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");

  if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }

  function getSubstringBetween(string, begin, end) {
    const substringBetween = string.substring(
      string.lastIndexOf(begin) + begin.length,
      string.lastIndexOf(end)
    );

    return substringBetween;
  }

  function getWhereClause(substring) {
    return getSubstringBetween(substring, "WHERE", "ORDER BY");
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

  // your collection url
  let orgUrl = "https://dev.azure.com/iot-gmbh";

  let token = process.env.AZURE_PERSONAL_ACCESS_TOKEN; // e.g "cbdeb34vzyuk5l4gxc4qfczn3lko3avfkfqyb47etahq6axpcqha";
  let authHandler = azdev.getPersonalAccessTokenHandler(token);

  const { Items } = this.entities;
  let connection = new azdev.WebApi(orgUrl, authHandler);
  let workItemAPI = await connection.getWorkItemTrackingApi();

  this.on("READ", Items, async (req) => {
    const { where } = req?.query?.SELECT;
    const userID = where && where[2]?.val;
    const selectBuilder = new SelectBuilder(req.query);
    const SQLString = selectBuilder.build();

    const whereClauseGeneric = getWhereClause(SQLString.sql);

    const whereClause = SQLString.values.reduce((string, value) => {
      return string.replace("?", `'${value}'`);
    }, whereClauseGeneric);

    const whereClauseWIQL = transformToWIQL(whereClause);

    if (!userID) return [];

    const workItemsByWIQL = await workItemAPI.queryByWiql({
      query: `SELECT [System.Id],[System.WorkItemType],[System.Title],[System.AssignedTo],[System.State],[System.Tags] FROM WorkItems WHERE [System.TeamProject] = 'IOT Projekte' AND [System.WorkItemType] <> '' AND ${whereClauseWIQL}`,
    });

    const ids = workItemsByWIQL.workItems.map(({ id }) => id);

    const wiDetails = (await workItemAPI.getWorkItems(ids)) || [];
    // https://dev.azure.com/{organization}/{project}/_apis/wit/workitems?ids={ids}&api-version=6.0

    const results = wiDetails
      .flatMap((item) => ({ id: item.id, ...item.fields }))
      .map((item) => ({
        ID: item.id,
        AssignedTo: item["System.AssignedTo"].uniqueName,
        AssignedToName: item["System.AssignedTo"].displayName,
        ChangedDate: item["System.ChangedDate"],
        CreatedDate: item["System.CreatedDate"],
        CompletedWork: item["Microsoft.VSTS.Scheduling.CompletedWork"],
        OriginalEstimate: item["Microsoft.VSTS.Scheduling.OriginalEstimate"],
        Reason: item["System.Reason"],
        State: item["System.State"],
        TeamProject: item["System.TeamProject"],
        Title: item["System.Title"],
        WorkItemType: item["System.WorkItemType"],
      }));

    results.$count = results.length;

    return results;
  });
});
