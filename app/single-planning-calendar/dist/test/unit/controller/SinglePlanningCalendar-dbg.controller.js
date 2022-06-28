/* global QUnit */

sap.ui.define(
  ["iot/single-planning-calendar/controller/SinglePlanningCalendar.controller"],
  (Controller) => {
    QUnit.module("SinglePlanningCalendar Controller");

    QUnit.test(
      "I should test the SinglePlanningCalendar controller",
      (assert) => {
        const oAppController = new Controller();
        oAppController.onInit();
        assert.ok(oAppController);
      },
    );
  },
);
