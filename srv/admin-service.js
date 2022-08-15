const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const { Categories, Tags, Tags2Categories } = db.entities("iot.planner");

  this.before("CREATE", "*", async (req) => {
    const { tenant } = req.user;
    req.data.tenant = tenant;
  });

  this.on("getCategoriesByID", async (req) => {
    const {
      data: { root, validAt },
      user,
    } = req;

    // TODO: implement filtering for user & tenant
    const query = `SELECT * FROM get_categories($1, $2)`;
    const results = await db.run(query, [user.tenant, root]);

    const categories = results.map(
      ({
        id,
        tenant,
        parent_id,
        title,
        description,
        hierarchylevel,
        catnumber,
      }) => ({
        ID: id,
        tenant,
        parent_ID: parent_id,
        title,
        description,
        hierarchyLevel: hierarchylevel,
        catNumber: catnumber,
      })
    );

    return categories;
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

    const categories = results.map(
      ({
        id,
        tenant,
        parent_id,
        title,
        hierarchylevel,
        catnumber,
        totalduration,
        accumulatedduration,
      }) => ({
        ID: id,
        tenant,
        parent_ID: parent_id,
        title,
        hierarchyLevel: hierarchylevel,
        totalDuration: totalduration,
        accumulatedDuration: accumulatedduration,
        relativeDuration: Math.round((totalduration * 100) / sum).toFixed(0),
        relativeAccDuration: Math.round(
          (accumulatedduration * 100) / sum
        ).toFixed(0),
        grandTotal: sum,
        catNumber: catnumber,
      })
    );

    return categories;
  });

  this.before("CREATE", "Categories", async (req) => {
    let siblings = [];
    let parent = {};

    if (req.data.parent_ID) {
      siblings = await this.read(Categories).where({ ID: req.data.parent_ID });
      [parent] = await this.read(Categories).where({
        ID: req.data.parent_ID,
      });
    } else {
      siblings = await this.read(Categories).where({ ID: null });
    }

    const levelSpecificNumber = (parseInt(siblings.length, 10) + 1).toString();

    if (parent) {
      req.data.catNumber = `${parent.catNumber}-${levelSpecificNumber}`;
    }
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
