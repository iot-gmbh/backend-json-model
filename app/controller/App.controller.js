sap.ui.define(
  [
    "../Authentication",
    "./BaseController",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
  ],
  (Authentication, BaseController, History, JSONModel) =>
    BaseController.extend("iot.planner.controller.App", {
      async onInit() {
        const session = await Authentication.init();

        this.setModel(new JSONModel(session), "session");
      },

      login() {
        Authentication.login();
        this.getModel("session").setData(Authentication.getSession());
      },

      logout() {
        Authentication.logout();
        this.getModel("session").setData(Authentication.getSession());
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
