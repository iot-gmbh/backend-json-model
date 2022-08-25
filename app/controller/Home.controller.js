sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) =>
  Controller.extend("iot.planner.Home", {
    navTo(event, target) {
      this.getOwnerComponent().getRouter().navTo(target);
    },
  })
);
