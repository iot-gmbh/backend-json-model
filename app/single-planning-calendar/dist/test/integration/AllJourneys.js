sap.ui.define(
  ["sap/ui/test/Opa5", "./arrangements/Startup", "./NavigationJourney"],
  (e, a) => {
    e.extendConfig({
      arrangements: new a(),
      viewNamespace: "iot.singleplanningcalendar.view.",
      autoWait: true,
    });
  },
);
