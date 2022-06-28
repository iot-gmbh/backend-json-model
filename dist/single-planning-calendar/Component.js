sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "iot/singleplanningcalendar/model/models",
  ],
  function (e, i, n) {
    "use strict";
    return e.extend("iot.singleplanningcalendar.Component", {
      metadata: { manifest: "json" },
      init: function () {
        e.prototype.init.apply(this, arguments);
        this.getRouter().initialize();
        this.setModel(n.createDeviceModel(), "device");
      },
    });
  }
);
