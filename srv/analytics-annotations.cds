using {AnalyticsService as my} from './analytics-service';

annotate my.WorkItems with @(UI : {
    Chart           : {
        $Type               : 'UI.ChartDefinitionType',
        ChartType           : #Donut,
        DimensionAttributes : [{
            $Type     : 'UI.ChartDimensionAttributeType',
            Dimension : customer_ID,
            Role      : #Category
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [customer_ID],
        Measures            : [duration],
    },
    SelectionFields : [
        activatedDate,
        completedDate,
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
