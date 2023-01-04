sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'iot.planner.billing',
            componentId: 'MyWorkItemsObjectPage',
            entitySet: 'MyWorkItems'
        },
        CustomPageDefinitions
    );
});