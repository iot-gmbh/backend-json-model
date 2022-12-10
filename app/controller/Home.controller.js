sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  (Controller, History) =>
    Controller.extend("iot.planner.controller.Home", {
      onNavBack() {
        const sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          history.go(-1);
        } else {
          this.getRouter().navTo("masterDetail", {}, true);
        }
      },

      navTo(event, pattern, target, deepRoute) {
        let deepRoutingConfig = {};

        if (target && deepRoute) {
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
