const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const { Categories, Tags, Tags2Categories } = db.entities("iot.planner");

  this.before("CREATE", "*", async (req) => {
    const { tenant } = req.user;
    req.data.tenant = tenant;
  });

  // this.on("READ", "Categories", async (req) => {
  //   const results = await db.run(
  //     SELECT.from("iot_planner_categories_aggregations").where(req.query)
  //     // .where`user_userPrincipalName = ${req.user.id}`
  //   );
  //   return results;
  // });

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
