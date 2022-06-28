sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "iot/singleplanningcalendar/model/models",
  ],
  (e, i, n) => e.extend("iot.singleplanningcalendar.Component", {
    metadata: { manifest: "json" },
    init() {
      e.prototype.init.apply(this, arguments);
      this.getRouter().initialize();
      this.setModel(n.createDeviceModel(), "device");
    },
  }),
);
