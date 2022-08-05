const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const { Tags, Tags2Categories } = db.entities("iot.planner");

  this.before("CREATE", "*", async (req) => {
    const { tenant } = req.user;
    req.data.tenant = tenant;
  });

  this.on("CREATE", "Tags", async (req, next) => {
    const tags = await this.read(Tags).where({ title: req.data.title });
    const tx = this.transaction(req);
    const newTag = { ...req.data };

    if (tags.length === 0) {
      return tx.run(INSERT(newTag).into(Tags));
    }
    return tx.run(UPDATE(Tags, tags[0]).with(tags[0]));
  });

  this.on("CREATE", "Tags2Categories", async (req, next) => {
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
