sap.ui.define(["./BaseController"], (BaseController) =>
  BaseController.extend("iot.planner.components.billing.controller.App", {
    onInit() {
      // apply content density mode to root view
      this.getView().addStyleClass(
        this.getOwnerComponent().getContentDensityClass()
      );
    },
  })
);
