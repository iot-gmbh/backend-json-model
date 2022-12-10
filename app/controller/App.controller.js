sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  (Controller, History) =>
    Controller.extend("iot.planner.controller.App", {
      onInit() {
        // apply content density mode to root view
        this.getView().addStyleClass(
          this.getOwnerComponent().getContentDensityClass()
        );
      },
      onPressNavBack() {
        const sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo("home", {}, true);
        }
      },

      onPressRefreshPage() {
        window.location.reload();
      },
    })
);
