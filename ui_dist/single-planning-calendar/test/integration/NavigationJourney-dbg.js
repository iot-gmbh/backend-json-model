/* global QUnit */

sap.ui.define(
  ["sap/ui/test/opaQunit", "./pages/SinglePlanningCalendar"],
  (opaTest) => {
    QUnit.module("Navigation Journey");

    opaTest(
      "Should see the initial page of the app",
      (Given, When, Then) => {
        // Arrangements
        Given.iStartMyApp();

        // Assertions
        Then.onTheAppPage.iShouldSeeTheApp();

        // Cleanup
        Then.iTeardownMyApp();
      },
    );
  },
);
