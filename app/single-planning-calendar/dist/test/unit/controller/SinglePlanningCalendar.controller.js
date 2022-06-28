sap.ui.define(
  ["iot/single-planning-calendar/controller/SinglePlanningCalendar.controller"],
  (n) => {
    QUnit.module("SinglePlanningCalendar Controller");
    QUnit.test(
      "I should test the SinglePlanningCalendar controller",
      (l) => {
        const e = new n();
        e.onInit();
        l.ok(e);
      },
    );
  },
);
