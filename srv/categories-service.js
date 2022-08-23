const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");

  function transformCategories(rawCategories, sum = 1) {
    return rawCategories.map(
      ({
        id,
        tenant,
        parent_id,
        title,
        path,
        hierarchylevel,
        absolutereference,
        shallowreference,
        deepreference,
        totalduration,
        accumulatedduration,
      }) => ({
        ID: id,
        tenant,
        parent_ID: parent_id,
        title,
        path,
        hierarchyLevel: hierarchylevel,
        totalDuration: totalduration,
        accumulatedDuration: accumulatedduration,
        relativeDuration: Math.round((totalduration * 100) / sum).toFixed(0),
        relativeAccDuration: Math.round(
          (accumulatedduration * 100) / sum
        ).toFixed(0),
        grandTotal: sum,
        absoluteReference: absolutereference,
        shallowReference: shallowreference,
        deepReference: deepreference,
      })
    );
  }

  this.before("CREATE", "*", async (req) => {
    const { tenant } = req.user;
    req.data.tenant = tenant;
  });

  this.on("getMyCategories", async (req) => {
    const results = await db.run(
      SELECT.from("iot_planner_my_categories")
        .where`user_userPrincipalName = ${req.user.id} and tenant = ${req.user.tenant}`
    );

    return transformCategories(results);
  });

  this.on("getCategoryTree", async (req) => {
    const {
      data: { root, validAt },
      user,
    } = req;

    // TODO: implement filtering for user & tenant
    const query = `SELECT * FROM get_categories($1, $2)`;
    const results = await db.run(query, [user.tenant, root]);

    return transformCategories(results);
  });

  this.on("getCumulativeCategoryDurations", async (req) => {
    const {
      data: { dateFrom, dateUntil, excludeEmptyDurations },
      user,
    } = req;

    let query = `SELECT * FROM get_cumulative_category_durations_with_path($1, $2, $3, $4)`;

    // Params in ODataV2 are sent as string => 'false' instead of false
    if (excludeEmptyDurations || excludeEmptyDurations === "true") {
      query += ` WHERE accumulatedDuration is not null`;
    }

    const results = await db.run(query, [
      user.tenant,
      user.id,
      dateFrom,
      dateUntil,
    ]);

    const [{ sum }] = await db.run(
      `SELECT sum(totalDuration) FROM get_durations($1, $2, $3, $4)`,
      [user.tenant, user.id, dateFrom, dateUntil]
    );

    return transformCategories(results, sum);
  });
});
