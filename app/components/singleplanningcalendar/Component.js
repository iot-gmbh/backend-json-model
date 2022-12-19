sap.ui.define(
  [
    "./model/models",
    "sap/ui/core/UIComponent",
    "iot/BackendJSONModel",
    "errorhandler/ErrorHandler",
  ],
  (models, UIComponent, BackendJSONModel, ErrorHandler) =>
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

          // call the base component's init function
          this.setModel(backendJSONModel);
          this.setModel(ODataModel, "OData");

          ErrorHandler.cover([ODataModel]);

          // // enable routing
          this.getRouter().initialize();

          // set the device model
          this.setModel(models.createDeviceModel(), "device");
        },
      }
    )
);
