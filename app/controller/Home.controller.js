sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) =>
  Controller.extend("iot.planner.controller.Home", {
    navTo(event, target) {
      this.getOwnerComponent().getRouter().navTo(target, {}, {});
    },

    navToMasterDetail() {
      // navTo($event, "trackViaCalendar&/calendar/singleEntry");
      this.getOwnerComponent()
        .getRouter()
        .navTo(
          "trackViaCalendar",
          {},
          {
            calendar: {
              route: "masterDetail",
            },
          }
        );
    },

    navToAnalytics() {
      this.getOwnerComponent()
        .getRouter()
        .navTo(
          "manageCategories",
          {},
          {
            manageCategories: {
              route: "graph",
            },
          }
        );
    },
  })
);
