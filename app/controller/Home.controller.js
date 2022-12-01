sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) =>
  Controller.extend("iot.planner.controller.Home", {
    navTo(event, target) {
      this.getOwnerComponent().getRouter().navTo(target);
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
