sap.ui.define(
  ["sap/ui/test/opaQunit", "./pages/SinglePlanningCalendar"],
  (e) => {
    QUnit.module("Navigation Journey");
    e("Should see the initial page of the app", (e, i, n) => {
      e.iStartMyApp();
      n.onTheAppPage.iShouldSeeTheApp();
      n.iTeardownMyApp();
    });
  },
);
