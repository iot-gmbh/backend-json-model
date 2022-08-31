sap.ui.define(["sap/ui/test/Opa5"], (Opa5) => {
  const sViewName = "SinglePlanningCalendar";
  Opa5.createPageObjects({
    onTheAppPage: {
      actions: {},

      assertions: {
        iShouldSeeTheApp() {
          return this.waitFor({
            id: "app",
            viewName: sViewName,
            success() {
              Opa5.assert.ok(true, `The ${sViewName} view is displayed`);
            },
            errorMessage: `Did not find the ${sViewName} view`,
          });
        },
      },
    },
  });
});
