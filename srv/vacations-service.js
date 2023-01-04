const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
    const db = await cds.connect.to("db");
    const { Vacations } = db.entities("iot.planner");

    // global variables needed for several handlers
    this.businessDays;
    this.id;

    // handles patches 
    this.before('PATCH', 'Vacations', async (req) => {
        this.id = req.data.ID;

        // req only has data from selected field, other data need to be fetched from draft entity
        let vacation = await SELECT.from("vacationsservice_vacations_drafts").where({ ID: this.id });
        let startDate = new Date(vacation[0].startdate).toString();
        let endDate = new Date(vacation[0].enddate).toString();
        this.businessDays = vacation[0].durationindays;

        // calculate business days
        if (req.data.startDate) {
            this.businessDays = _countBusinessDays(req.data.startDate, endDate);
        } else if (req.data.endDate) {
            this.businessDays = _countBusinessDays(startDate, req.data.endDate);
        }

        // set duration in draft to the number of business days
        return req.data.durationInDays = this.businessDays;
    });

    // handles draft activations
    this.before('draftActivate', 'Vacations', () => {

        // updates the duration field in the vacations table
        return UPDATE(Vacations).set({ durationInDays: this.businessDays }).where({ ID: this.id });
    });

    /**
     * Calculates time span between two dates.
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns Number of business days
     */
    const _countBusinessDays = (startDate, endDate) => {
        let businessDays = 0;
        let endTime = new Date(endDate).getTime();
        let currentDay = new Date(startDate);

        while (currentDay.getTime() <= endTime) {
            let weekday = currentDay.getDay();
            if (weekday != 0 && weekday != 6) { // 0=Sunday, 6=Saturday
                businessDays++;
            }
            // get next day
            currentDay.setDate(currentDay.getDate() + 1);
        }

        return businessDays;
    };
});
