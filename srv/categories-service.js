const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const { Tags, Tags2Categories, Categories } = db.entities("iot.planner");

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
        invoicerelevance,
        bonusrelevance,
      }) => ({
        ID: id,
        tenant,
        parent_ID:
          // remove dummy-category appearance in frontend (otherwise there will be problems when nesting the categories)
          // hopefully the dummy-category won't be necessary when we upgrad to cds > 6 and @assert.notNull can be used
          // in cds < 6 @assert.notNull has no effect
          parent_id === "2e74e68d-57c3-4e0b-9cb9-52cfaf7dbfcb"
            ? null
            : parent_id,
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
        invoiceRelevance: invoicerelevance,
        bonusRelevance: bonusrelevance,
      })
    );
  }

  this.before("CREATE", "Categories", (req) => {
    const { tenant } = req.user;
    req.data.tenant = tenant;
    // eslint-disable-next-line no-return-assign, no-param-reassign
    req.data.members.forEach((member) => (member.tenant = tenant));
  });

  this.on("getMyCategoryTree", async (req) => {
    const results = await db.run(
      SELECT.from("iot_planner_my_categories")
        .where`user_userPrincipalName = ${req.user.id} and tenant = ${req.user.tenant}`
    );

    return transformCategories(results);
  });

  this.on("getMyCustomers", async () => {
    const customers = await db.run(
      SELECT.from("iot_planner_my_categories").where`hierarchyLevel = '0'`
    );

    return transformCategories(customers);
  });

  this.on("getMyProjects", async () => {
    const projects = await db.run(
      SELECT.from("iot_planner_my_categories").where`hierarchyLevel = '1'`
    );

    return transformCategories(projects);
  });

  this.on("getMySubprojects", async () => {
    const subProjects = await db.run(
      SELECT.from("iot_planner_my_categories").where`hierarchyLevel = '2'`
    );

    return transformCategories(subProjects);
  });

  this.on("getMyWorkPackages", async () => {
    const workPackages = await db.run(
      SELECT.from("iot_planner_my_categories").where`hierarchyLevel = '3'`
    );

    return transformCategories(workPackages);
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

  this.on("checkIfUserIsAdmin", async (req) => req.user.is("admin"));

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
