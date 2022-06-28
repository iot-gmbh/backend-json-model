sap.ui.define(["sap/ui/test/Opa5"], (Opa5) => Opa5.extend(
  "iot.singleplanningcalendar.test.integration.arrangements.Startup",
  {
    iStartMyApp(oOptionsParameter) {
      const oOptions = oOptionsParameter || {};

      // start the app with a minimal delay to make tests fast but still async to discover basic timing issues
      oOptions.delay = oOptions.delay || 50;

      // start the app UI component
      this.iStartMyUIComponent({
        componentConfig: {
          name: "iot.singleplanningcalendar",
          async: true,
        },
        hash: oOptions.hash,
        autoWait: oOptions.autoWait,
      });
    },
  },
));
