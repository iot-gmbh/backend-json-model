sap.ui.define(
  ["sap/ui/test/Opa5", "./arrangements/Startup", "./NavigationJourney"],
  (Opa5, Startup) => {
    Opa5.extendConfig({
      arrangements: new Startup(),
      viewNamespace: "iot.planner.components.singleplanningcalendar.view.",
      autoWait: true,
    });
  }
);
