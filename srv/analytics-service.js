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

    const sqlQuery = sql
      // TODO: Abhängigkeit auf Reihenfolge der Selektion (=> duration) entfernen
      .replace("duration FROM", "sum (duration) as duration FROM");

    const results = await srv.run(sqlQuery);

    return results;
  });
};
