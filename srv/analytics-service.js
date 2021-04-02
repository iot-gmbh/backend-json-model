module.exports = (srv) => {
  const { SelectBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");
  const { WorkItems } = srv.entities;

  srv.on("READ", WorkItems, async (req) => {
    let query = req.query;
    query.SELECT.groupBy = [
      "customer_friendlyID",
      "assignedTo_userPrincipalName",
      "project_ID",
    ];

    // if (!req.query.SELECT.columns.find(({ ref }) => ref[0] === "duration")) {
    //   req.query.SELECT.columns.push({ ref: ["duration"] });
    // }

    // query.SELECT.from = query.SELECT.from;
    // .concat([]);

    const selectBuilder = new SelectBuilder(query);
    const { sql, values } = selectBuilder.build();

    const SQLString = sql
      // TODO: Abhängigkeit auf Reihenfolge der Selektion (=> duration) entfernen
      .replace("duration FROM", "sum (duration) as duration FROM");

    const results = await srv.run(SQLString, values);

    return results;
  });
};
