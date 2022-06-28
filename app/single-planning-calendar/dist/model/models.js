sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
  (e, n) => ({
    createDeviceModel() {
      const i = new e(n);
      i.setDefaultBindingMode("OneWay");
      return i;
    },
  }),
);
