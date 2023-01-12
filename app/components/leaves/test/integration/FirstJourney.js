sap.ui.define(["sap/ui/test/opaQunit"], (opaTest) => {
  const Journey = {
    run() {
      QUnit.module("First journey");

      opaTest("Start application", (Given, When, Then) => {
        Given.iStartMyApp();

        Then.onTheLeavesList.iSeeThisPage();
      });

      opaTest("Navigate to ObjectPage", (Given, When, Then) => {
        // Note: this test will fail if the ListReport page doesn't show any data
        When.onTheLeavesList.onFilterBar().iExecuteSearch();
        Then.onTheLeavesList.onTable().iCheckRows();

        When.onTheLeavesList.onTable().iPressRow(0);
        Then.onTheLeavesObjectPage.iSeeThisPage();
      });

      opaTest("Teardown", (Given, When, Then) => {
        // Cleanup
        Given.iTearDownMyApp();
      });
    },
  };

  return Journey;
});
