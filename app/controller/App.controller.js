sap.ui.define(
  [
    // "../Authentication",
    "./BaseController",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "errorhandler/ErrorHandler",
  ],
  (BaseController, History, JSONModel, ErrorHandler) =>
    BaseController.extend("iot.planner.controller.App", {
      onInit() {
        const headerToolbarHeight = 49;
        const heightWithoutHeaderToolbar =
          $(document).height() - headerToolbarHeight;
        this.setModel(
          new JSONModel({
            heightWithoutHeaderToolbar: `${heightWithoutHeaderToolbar}px`,
          }),
          "viewModel"
        );
      },

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
