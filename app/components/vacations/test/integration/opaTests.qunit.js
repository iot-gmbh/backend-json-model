sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'vacation/test/integration/FirstJourney',
		'vacation/test/integration/pages/VacationsList',
		'vacation/test/integration/pages/VacationsObjectPage'
    ],
    function(JourneyRunner, opaJourney, VacationsList, VacationsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('vacation') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheVacationsList: VacationsList,
					onTheVacationsObjectPage: VacationsObjectPage
                }
            },
            opaJourney.run
        );
    }
);