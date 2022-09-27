sap.ui.define(
  ["sap/ui/core/UIComponent", "iot/BackendJSONModel", "./model/models"],
  (UIComponent, BackendJSONModel, models) =>
    UIComponent.extend("iot.planner.components.workitems.Component", {
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
        // call the base component's init function
        UIComponent.prototype.init.apply(this, ...args);

        const backendJSONModel = new BackendJSONModel("/v2/timetracking/");

        this.setModel(backendJSONModel, "backendJSONModel");

        // enable routing
        this.getRouter().initialize();

        // set the device model
        this.setModel(models.createDeviceModel(), "device");
      },

      exit() {
        this.getModel("backendJSONModel").destroy();
      },
    })
);
