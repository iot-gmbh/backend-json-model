using {AnalyticsService as my} from './analytics-service';

annotate my.WorkItems with @(UI : {
    // -----------------------------------------------------
    // Duration by Project
    // -----------------------------------------------------
    PresentationVariant #DurationByProject  : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{
            Descending : true,
            Property   : duration,
        }],
        Visualizations : ['@UI.Chart#DurationByProject', ],
    },
    Chart #DurationByProject                : {
        $Type               : 'UI.ChartDefinitionType',
        ChartType           : #Column,
        DimensionAttributes : [{
            $Type     : 'UI.ChartDimensionAttributeType',
            Dimension : project_friendlyID,
            Role      : #Category
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [
            project_friendlyID,
            customer_friendlyID
        ],
        Measures            : [duration],
    },

    // -----------------------------------------------------
    // Duration by Customer
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
    // Duration by Date
    // -----------------------------------------------------
    PresentationVariant                     : {
        $Type     : 'UI.PresentationVariantType',
        SortOrder : [{
            Descending : true,
            Property   : duration,
        }],
    // Visualizations : ['@UI.Chart', ],
    },
    Chart                                   : {
        $Type               : 'UI.ChartDefinitionType',
        ChartType           : #Column,
        DimensionAttributes : [{
            $Type     : 'UI.ChartDimensionAttributeType',
            Dimension : activatedDate,
            Role      : #Series
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [activatedDate],
        Measures            : [duration],
    },
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
    };
    project_friendlyID  @Common.ValueList : {
        CollectionPath               : 'WorkItems',
        Parameters                   : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'project_friendlyID',
            ValueListProperty : 'project_friendlyID'
        }],
        PresentationVariantQualifier : 'DurationByProject'
    }
};
