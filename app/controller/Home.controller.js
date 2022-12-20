sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) =>
  Controller.extend("iot.planner.controller.Home", {
    navTo(event, pattern, target, deepRoute) {
      let deepRoutingConfig = {};

      if (target) {
        deepRoutingConfig = {
          [target]: { route: deepRoute },
        };
      }
      this.getOwnerComponent()
        .getRouter()
        .navTo(pattern, {}, deepRoutingConfig);
    },

    navToMasterDetail() {
      // navTo($event, "trackViaCalendar&/calendar/singleEntry");
      this.getOwnerComponent()
        .getRouter()
        .navTo(
          "trackViaCalendar",
          {},
          {
            spc: {
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
