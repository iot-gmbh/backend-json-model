using {AnalyticsService as my} from './analytics-service';

annotate my.WorkItems with @(UI : {
    Chart           : {
        $Type               : 'UI.ChartDefinitionType',
        ChartType           : #Donut,
        DimensionAttributes : [{
            $Type     : 'UI.ChartDimensionAttributeType',
            Dimension : customer_friendlyID,
            Role      : #Category
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [customer_friendlyID],
        Measures            : [duration],
    },
    SelectionFields : [
        activatedDate,
        completedDate,
        assignedTo_userPrincipalName,
        customer_friendlyID,
        project_ID
    ],
    LineItem        : [
        {
            $Type : 'UI.DataField',
            Value : assignedTo_userPrincipalName,
        },
        {
            $Type : 'UI.DataField',
            Value : customer_friendlyID,
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

//                            @(Common : {ValueList #WorkItems : {
//     $Type                        : 'Common.ValueListType',
//     CollectionPath               : 'WorkItems',
//     PresentationVariantQualifier : 'PriorityTxt',
//     Parameters                   : [{
//         $Type             : 'Common.ValueListParameterInOut',
//         LocalDataProperty : 'PriorityTxt',
//         ValueListProperty : 'PriorityTxt'
//     }]
// }});
