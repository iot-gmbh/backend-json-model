using {AnalyticsService as my} from './analytics-service';

annotate my.WorkItems with @(UI : {
    PresentationVariant : {
        $Type     : 'UI.PresentationVariantType',
        SortOrder : [{
            Descending : true,
            Property   : duration,
        }],
    // Visualizations : [{$value : ![@UI.Chart]}]
    },
    Chart               : {
        $Type               : 'UI.ChartDefinitionType',
        ChartType           : #Column,
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
    SelectionFields     : [
        activatedDate,
        completedDate,
        assignedTo_userPrincipalName,
        customer_friendlyID,
        project_friendlyID
    ],
    LineItem            : [
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
            Value : project_friendlyID,
        },
        {
            $Type : 'UI.DataField',
            Value : duration,
        },
    ]
});

// annotate my.Projects with @(UI : {
//     PresentationVariant : {
//         $Type          : 'UI.PresentationVariantType',
//         Visualizations : [{$value : ![@UI.Chart]}]
//     },
//     Chart                    : {
//         $Type               : 'UI.ChartDefinitionType',
//         ChartType           : #Column,
//         DimensionAttributes : [{
//             $Type     : 'UI.ChartDimensionAttributeType',
//             Dimension : customer_ID,
//             Role      : #Category
//         }, ],
//         MeasureAttributes   : [{
//             $Type   : 'UI.ChartMeasureAttributeType',
//             Measure : friendlyID,
//             Role    : #Axis1
//         }],
//         Dimensions          : [customer_ID],
//         Measures            : [friendlyID],
//     },
// });
