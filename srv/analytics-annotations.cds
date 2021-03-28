using {AnalyticsService as my} from './analytics-service';

annotate my.WorkItems with @(UI : {
    SelectionFields : [
        assignedTo_userPrincipalName,
        customer_ID,
        project_ID
    ],
    LineItem        : [
        {
            $Type : 'UI.DataField',
            Value : assignedTo_userPrincipalName,
        },
        {
            $Type : 'UI.DataField',
            Value : customer_ID,
        },
        {
            $Type : 'UI.DataField',
            Value : project_ID,
        },
        {
            $Type : 'UI.DataField',
            Value : duration,
        },
    ]
});
