const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  /**
   * Calculates time span between two dates.
   * @param {string} startDate
   * @param {string} endDate
   * @returns Number of business days
   */
  const _countBusinessDays = (startDate, endDate) => {
    let businessDays = 0;
    const endTime = new Date(endDate).getTime();
    const currentDay = new Date(startDate);

    while (currentDay.getTime() <= endTime) {
      const weekday = currentDay.getDay();
      if (weekday !== 0 && weekday !== 6) {
        // 0=Sunday, 6=Saturday
        businessDays += 1;
      }
      // get next day
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return businessDays;
  };

  // handles patches
  this.before("PATCH", "Leaves", async (req) => {
    const id = req.data.ID;

    // req only has data from selected field, other data need to be fetched from draft entity
    const leave = await SELECT.from("leavesservice_leaves_drafts").where({
      ID: id,
    });
    const startDate = new Date(leave[0].startdate).toString();
    const endDate = new Date(leave[0].enddate).toString();
    this.businessDays = leave[0].durationindays;

    // calculate business days
    if (req.data.startDate) {
      req.data.durationInDays = _countBusinessDays(req.data.startDate, endDate);
    } else if (req.data.endDate) {
      req.data.durationInDays = _countBusinessDays(startDate, req.data.endDate);
    }
  });

  this.before(["NEW", "EDIT"], "Leaves", async (req) => {
    req.data.user_userPrincipalName = req.user.id;
  });
});
