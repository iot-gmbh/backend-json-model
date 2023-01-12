sap.ui.require(
  [
    "sap/fe/test/JourneyRunner",
    "leave/test/integration/FirstJourney",
    "leave/test/integration/pages/LeavesList",
    "leave/test/integration/pages/LeavesObjectPage",
  ],
  (JourneyRunner, opaJourney, LeavesList, LeavesObjectPage) => {
    var JourneyRunner = new JourneyRunner({
      // start index.html in web folder
      launchUrl: `${sap.ui.require.toUrl("leave")}/index.html`,
    });

    JourneyRunner.run(
      {
        pages: {
          onTheLeavesList: LeavesList,
          onTheLeavesObjectPage: LeavesObjectPage,
        },
      },
      opaJourney.run
    );
  }
);
