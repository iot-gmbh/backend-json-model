using {AnalyticsService as my} from './analytics-service';

annotate my.WorkItems with @(UI : {
    PresentationVariant                     : {
        $Type     : 'UI.PresentationVariantType',
        SortOrder : [{
            Descending : true,
            Property   : duration,
        }],
    },
    Chart                                   : {
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
        Dimensions          : [
            customer_friendlyID,
            project_friendlyID
        ],
        Measures            : [duration],
    },

    // -----------------------------------------------------
    // Items by Customer
    // -----------------------------------------------------
    PresentationVariant #DurationByCustomer : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{
            Descending : true,
            Property   : duration,
        }],
        Visualizations : ['@UI.Chart#DurationByCustomer', ],
    },
    Chart #DurationByCustomer               : {
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

    // -----------------------------------------------------
    // Items by Date
    // -----------------------------------------------------
    // PresentationVariant #DurationByCustomer : {
    //     $Type          : 'UI.PresentationVariantType',
    //     SortOrder      : [{
    //         Descending : true,
    //         Property   : duration,
    //     }],
    //     Visualizations : ['@UI.Chart#DurationByCustomer', ],
    // },
    // Chart #DurationByCustomer               : {
    //     $Type               : 'UI.ChartDefinitionType',
    //     ChartType           : #Column,
    //     DimensionAttributes : [{
    //         $Type     : 'UI.ChartDimensionAttributeType',
    //         Dimension : customer_friendlyID,
    //         Role      : #Category
    //     }, ],
    //     MeasureAttributes   : [{
    //         $Type   : 'UI.ChartMeasureAttributeType',
    //         Measure : duration,
    //         Role    : #Axis1
    //     }],
    //     Dimensions          : [customer_friendlyID],
    //     Measures            : [duration],
    // },
    SelectionFields                         : [
        activatedDate,
        completedDate,
        assignedTo_userPrincipalName,
        customer_friendlyID,
        project_friendlyID
    ],
    LineItem                                : [
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
}) {
    customer_friendlyID @Common.ValueList : {
        CollectionPath               : 'WorkItems',
        Parameters                   : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'customer_friendlyID',
            ValueListProperty : 'customer_friendlyID'
        }],
        PresentationVariantQualifier : 'DurationByCustomer'
    }
};
