sap.ui.define(
  ["sap/ui/core/UIComponent", "iot/backendJSONModel", "./model/models"],
  (UIComponent, BackendJSONModel, models) =>
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

        const backendJSONModel = new BackendJSONModel("/v2/timetracking/");
        const ODataModel = backendJSONModel.getODataModel();

        // call the base component's init function
        this.setModel(backendJSONModel);
        this.setModel(ODataModel, "OData");

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        // create the views based on the url/hash
        this.getRouter().initialize();
      },
    })
);
