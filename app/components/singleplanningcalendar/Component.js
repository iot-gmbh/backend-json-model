sap.ui.define(
  [
    "iot/CustomODataV2Model",
    "errorhandler/ErrorHandler",
    "./model/models",
    "sap/ui/core/UIComponent",
  ],
  (CustomODataV2Model, ErrorHandler, models, UIComponent) =>
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

          const customODataV2Model = new CustomODataV2Model(
            "/v2/timetracking/"
          );

          // call the base component's init function
          this.setModel(customODataV2Model);

          ErrorHandler.cover([customODataV2Model.ODataModel]);

          // // enable routing
          // this.getRouter().initialize();

          // set the device model
          this.setModel(models.createDeviceModel(), "device");
        },
      }
    )
);
