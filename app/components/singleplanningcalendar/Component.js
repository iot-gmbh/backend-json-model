sap.ui.define(
  ["./model/models", "sap/ui/core/UIComponent"],
  (models, UIComponent) =>
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
          // // enable routing
          this.getRouter().initialize();

          // set the device model
          this.setModel(models.createDeviceModel(), "device");
        },
      }
    )
);
