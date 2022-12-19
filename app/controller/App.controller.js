sap.ui.define(
  [
    // "../Authentication",
    "./BaseController",
    "sap/ui/core/routing/History",
    "iot/BackendJSONModel",
    "errorhandler/ErrorHandler",
  ],
  (BaseController, History, BackendJSONModel, ErrorHandler) =>
    BaseController.extend("iot.planner.controller.App", {
      login() {
        return this.getOwnerComponent().login();
      },

      async logout() {
        return this.getOwnerComponent().logout();
      },

      onPressNavBack() {
        const sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          history.go(-1);
        } else {
          this.getRouter().navTo("home", {}, true);
        }
      },

      onPressRefreshPage() {
        window.location.reload();
      },
    })
);
