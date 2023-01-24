sap.ui.define(
  [
    "iot/BackendJSONModel",
    "errorhandler/ErrorHandler",
    "./model/models",
    "sap/ui/core/UIComponent",
  ],
  (BackendJSONModel, ErrorHandler, models, UIComponent) =>
    UIComponent.extend("iot.planner.components.BaseComponent", {
      async init(servicePath, ...args) {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, ...args);

        const backendJSONModel = new BackendJSONModel(servicePath, {
          useBatch: false,
        });

        const ODataModel = backendJSONModel.getODataModel();
        // call the base component's init function
        this.setModel(backendJSONModel);
        this.setModel(ODataModel, "OData");
        this.setModel(models.createDeviceModel(), "device");

        const router = this.getRouter();

        router.attachBeforeRouteMatched(() => {
          if (this._metadataLoadingFailed) {
            setTimeout(() => {
              this.getRouter().getTargets().display("errorOnStartup");
            });
          }
        });

        try {
          await ErrorHandler.cover([ODataModel]);
          router.initialize();
        } catch (error) {
          // Metadata or authorization errors
          // this.getModel("session").setProperty(
          //   "/errorOnStartupText",
          //   error.message
          // );

          router.initialize();
          // TODO: On consequent navigation, the target will be overwritten and invisible
          this.getRouter().getTargets().display("errorOnStartup");

          this._metadataLoadingFailed = true;
        }
      },

      getRootComponent() {
        return this.oContainer
          .getParent()
          .getParent()
          .getController()
          .getOwnerComponent();
      },
    })
);
