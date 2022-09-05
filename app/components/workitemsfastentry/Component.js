sap.ui.define(
  ["sap/ui/core/UIComponent", "./CustomODataV2Model", "./model/models"],
  (UIComponent, CustomODataV2Model, models) =>
    UIComponent.extend("iot.planner.components.workitemsfastentry.Component", {
      metadata: {
        manifest: "json",
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * In this function, the device models are set and the router is initialized.
       * @public
       * @override
       */
      init(...args) {
        UIComponent.prototype.init.apply(this, ...args);

        // call the base component's init function
        this.setModel(new CustomODataV2Model("/v2/timetracking/"));

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        // create the views based on the url/hash
        this.getRouter().initialize();
      },
    })
);
