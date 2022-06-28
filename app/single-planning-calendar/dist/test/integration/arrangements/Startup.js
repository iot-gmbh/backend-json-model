sap.ui.define(["sap/ui/test/Opa5"], (t) => t.extend(
  "iot.singleplanningcalendar.test.integration.arrangements.Startup",
  {
    iStartMyApp(t) {
      const n = t || {};
      n.delay = n.delay || 50;
      this.iStartMyUIComponent({
        componentConfig: { name: "iot.singleplanningcalendar", async: true },
        hash: n.hash,
        autoWait: n.autoWait,
      });
    },
  },
));
