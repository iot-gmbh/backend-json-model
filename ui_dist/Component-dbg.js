sap.ui.define(["sap/ui/core/UIComponent"], (UIComponent) =>
  UIComponent.extend("iot.planner.Component", {
    metadata: {
      manifest: "json",
    },

    init(...args) {
      UIComponent.prototype.init.apply(this, ...args);

      // create the views based on the url/hash
      this.getRouter().initialize();
    },
  })
);
