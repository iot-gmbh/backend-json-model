sap.ui.define(
  [
    "iot/BackendJSONModel",
    "errorhandler/ErrorHandler",
    "./model/models",
    "sap/ui/core/UIComponent",
  ],
  (BackendJSONModel, ErrorHandler, models, UIComponent) =>
    UIComponent.extend(
      "iot.planner.components.singleplanningcalendar.Component",
      {
        metadata: {
          manifest: "json",
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init(...args) {
          // call the base component's init function
          UIComponent.prototype.init.apply(this, ...args);

          const backendJSONModel = new BackendJSONModel("/v2/timetracking/");
          const ODataModel = backendJSONModel.getODataModel();

          // call the base component's init function
          this.setModel(backendJSONModel);
          this.setModel(ODataModel, "OData");

          ErrorHandler.cover([ODataModel]);

          // // enable routing
          this.getRouter().initialize();

          // set the device model
          this.setModel(models.createDeviceModel(), "device");
        },

        exit() {
          this.getModel().destroy();
          this.getModel("OData").destroy();
        },
      }
    )
);
