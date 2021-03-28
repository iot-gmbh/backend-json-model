module.exports = (srv) => {
  const { SelectBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");
  const { WorkItems } = srv.entities;
  srv.on("READ", WorkItems, async (req) => {
    let query = req.query;
    query.SELECT.groupBy = [
      "customer_ID",
      "assignedTo_userPrincipalName",
      "project_ID",
    ];
    
    const selectBuilder = new SelectBuilder(query);
    const { sql } = selectBuilder.build();

    // Exmpl: sql:'SELECT assignedTo_userPrincipalName, customer_ID, project_ID, duration FROM AnalyticsService_WorkItems ORDER BY assignedTo_userPrincipalName ASC, customer_ID ASC, project_ID ASC LIMIT 140'

    const sqlQuery = sql
      // TODO: Abhängigkeit auf Reihenfolge der Selektion (=> duration) entfernen
      .replace("duration FROM", "sum (duration) as duration FROM");

    // const table = "iot_planner_WorkItems";
    // const columns = [
    //   "customer_ID",
    //   "assignedTo_userPrincipalName",
    //   "project_ID",
    //   "sum (duration) as duration",
    // ].join(", ");
    // const groupBy = "customer_ID, assignedTo_userPrincipalName, project_ID";
    // const whereClause =
    //   "customer_ID IS NOT NULL AND assignedTo_userPrincipalName IS NOT NULL AND project_ID IS NOT NULL";
    // const selectQuery = `SELECT ${columns} FROM '${table}' WHERE ${whereClause} GROUP BY ${groupBy}`;

    const results = await srv.run(sqlQuery);

    return results;
  });
};
