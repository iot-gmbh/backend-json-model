sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "iot/CustomODataV2Model",
    "./model/models",
    "errorhandler/ErrorHandler",
  ],
  (UIComponent, CustomODataV2Model, models, ErrorHandler) =>
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

        const customODataV2Model = new CustomODataV2Model("/v2/timetracking/");

        // call the base component's init function
        this.setModel(customODataV2Model);

        ErrorHandler.cover([customODataV2Model.ODataModel]);

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        // create the views based on the url/hash
        this.getRouter().initialize();
      },
    })
);
