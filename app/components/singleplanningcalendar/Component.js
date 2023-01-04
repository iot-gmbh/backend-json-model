sap.ui.define(
  [
    "./model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "iot/BackendJSONModel",
    "errorhandler/ErrorHandler",
  ],
  (models, JSONModel, UIComponent, BackendJSONModel, ErrorHandler) =>
    UIComponent.extend(
      "iot.planner.components.singleplanningcalendar.Component",
      {
        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        async init(...args) {
          // call the base component's init function
          UIComponent.prototype.init.apply(this, ...args);

          const backendJSONModel = new BackendJSONModel("/v2/timetracking/", {
            useBatch: false,
          });

          const ODataModel = backendJSONModel.getODataModel();
          const appView = new JSONModel({
            errorOnStartupText: "A general error occured",
            busy: true,
            delay: 0,
          });

          this.setModel(appView, "appView");

          // call the base component's init function
          this.setModel(backendJSONModel);
          this.setModel(ODataModel, "OData");
          this.setModel(models.createDeviceModel(), "device");

          const router = this.getRouter();

          try {
            await ErrorHandler.cover([this.getModel()]);
            router.initialize();
          } catch (error) {
            router.initialize();

            appView.setProperty("/errorOnStartupText", error.message);
            router.getTargets().display("errorOnStartup");
          }
        },
      }
    )
);
