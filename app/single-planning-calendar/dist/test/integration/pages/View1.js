sap.ui.define(["sap/ui/test/Opa5"], (e) => {
  const i = "SinglePlanningCalendar";
  e.createPageObjects({
    onTheAppPage: {
      actions: {},
      assertions: {
        iShouldSeeTheApp() {
          return this.waitFor({
            id: "app",
            viewName: i,
            success() {
              e.assert.ok(true, `The ${i} view is displayed`);
            },
            errorMessage: `Did not find the ${i} view`,
          });
        },
      },
    },
  });
});
