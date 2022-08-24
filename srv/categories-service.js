const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const { Tags, Tags2Categories } = db.entities("iot.planner");

  function transformCategories(rawCategories, sum = 1) {
    return rawCategories.map(
      ({
        id,
        tenant,
        parent_id,
        title,
        path,
        hierarchylevel,
        description,
        validfrom,
        validto,
        totalduration,
        absolutereference,
        shallowreference,
        deepreference,
        accumulatedduration,
      }) => ({
        ID: id,
        tenant,
        parent_ID: parent_id,
        title,
        path,
        hierarchyLevel: hierarchylevel,
        description,
        validFrom: validfrom,
        validTo: validto,
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

  this.on("getMyCategoryTree", async (req) => {
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
    const query = `SELECT * FROM get_categories($1, $2, $3)`;
    const results = await db.run(query, [user.tenant, root, validAt]);

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

  this.on("CREATE", "Tags", async (req) => {
    const tags = await this.read(Tags).where({ title: req.data.title });
    const tx = this.transaction(req);
    const newTag = { ...req.data };

    if (tags.length === 0) {
      return tx.run(INSERT(newTag).into(Tags));
    }
    return tx.run(UPDATE(Tags, tags[0]).with(tags[0]));
  });

  this.on("CREATE", "Tags2Categories", async (req) => {
    const tags = await this.read(Tags2Categories).where({
      tag_title: req.data.tag_title,
      category_ID: req.data.category_ID,
    });
    const tx = this.transaction(req);
    const newTag = { ...req.data };

    if (tags.length === 0) {
      return tx.run(INSERT(newTag).into(Tags2Categories));
    }
    return tx.run(UPDATE(Tags2Categories, tags[0]).with(tags[0]));
  });
});
