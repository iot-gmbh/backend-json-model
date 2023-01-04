sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'iot/planner/billing/test/integration/FirstJourney',
		'iot/planner/billing/test/integration/pages/MyWorkItemsList',
		'iot/planner/billing/test/integration/pages/MyWorkItemsObjectPage'
    ],
    function(JourneyRunner, opaJourney, MyWorkItemsList, MyWorkItemsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('iot/planner/billing') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMyWorkItemsList: MyWorkItemsList,
					onTheMyWorkItemsObjectPage: MyWorkItemsObjectPage
                }
            },
            opaJourney.run
        );
    }
);