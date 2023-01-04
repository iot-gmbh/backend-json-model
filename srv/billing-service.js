const cds = require("@sap/cds");
const moment = require("moment");

module.exports = cds.service.impl(async function () {
  this.on("READ", "MyWorkItems", async (req) => {
    const { query } = req;

    const items = await cds.tx(req).run(query);

    const MyWorkItems = items.map((itm) => ({
      ID: itm.ID,
      title: itm.title,
      location: itm.location,
      duration: itm.duration,
      workDate: moment(itm.workDate).format("DD.MM.yyyy"),
      startTime: moment(itm.workDate).format("HH:mm"),
      endTime: moment(itm.endTime).format("HH:mm"),
      assignedToUserPrincipalName: itm.assignedToUserPrincipalName,
      managerUserPrincipalName: itm.managerUserPrincipalName,
      customer: itm.customer,
      project: itm.project,
      subProject: itm.subProject,
      workPackage: itm.workPackage,
      customerText: itm.customerText,
      projectText: itm.projectText,
      subProjectText: itm.subProjectText,
      workPackageText: itm.workPackageText,
    }));

    return MyWorkItems;
  });
});
