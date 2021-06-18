using {AnalyticsService as my} from './analytics-service';

annotate my.WorkItems with @(UI : {
    // =====================================================
    // Duration by Project
    //
    PresentationVariant                       : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{
            Descending : true,
            Property   : duration,
        }],
        Visualizations : ['@UI.Chart'],
    },
    Chart                                     : {
        $Type               : 'UI.ChartDefinitionType',
        ChartType           : #Column,
        DimensionAttributes : [{
            $Type     : 'UI.ChartDimensionAttributeType',
            Dimension : projectTitle,
            Role      : #Category
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [
            customerName,
            projectTitle
        ],
        Measures            : [duration],
    },

    // =====================================================
    // Duration by Customer
    //
    PresentationVariant #DurationByCustomer   : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{
            Descending : true,
            Property   : duration,
        }],
        Visualizations : ['@UI.Chart#DurationByCustomer', ],
    },
    Chart #DurationByCustomer                 : {
        $Type               : 'UI.ChartDefinitionType',
        ChartType           : #Column,
        DimensionAttributes : [{
            $Type     : 'UI.ChartDimensionAttributeType',
            Dimension : customerName,
            Role      : #Category
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [customerName],
        Measures            : [duration],
    },

    // =====================================================
    // Duration by Month
    //
    PresentationVariant #DurationByMonth      : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{
            Descending : true,
            Property   : duration,
        }],
        Visualizations : ['@UI.Chart#DurationByMonth', ],
    },
    Chart #DurationByMonth                    : {
        $Type               : 'UI.ChartDefinitionType',
        ChartType           : #Column,
        DimensionAttributes : [{
            $Type     : 'UI.ChartDimensionAttributeType',
            Dimension : activatedDateMonth,
            Role      : #Series
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [activatedDateMonth],
        Measures            : [duration],
    },

    // =====================================================
    // Duration by AssignedTo
    //
    PresentationVariant #DurationByAssignedTo : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{
            Descending : true,
            Property   : duration,
        }],
        Visualizations : ['@UI.Chart#DurationByAssignedTo', ],
    },
    Chart #DurationByAssignedTo               : {
        $Type               : 'UI.ChartDefinitionType',
        ChartType           : #Column,
        DimensionAttributes : [{
            $Type     : 'UI.ChartDimensionAttributeType',
            Dimension : assignedToName,
            Role      : #Category
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [assignedToName],
        Measures            : [duration],
    },
    SelectionFields                           : [
        activatedDate,
        completedDate,
        activatedDateMonth,
        assignedToName,
        customerName,
        projectTitle,
    ],
    LineItem                                  : [
        {
            $Type : 'UI.DataField',
            Value : assignedToName,
        },
        {
            $Type : 'UI.DataField',
            Value : customerName,
        },
        {
            $Type : 'UI.DataField',
            Value : projectTitle,
        },
        {
            $Type : 'UI.DataField',
            Value : duration,
        },
    ]
}) {
    // customer_ID                  @Common.ValueList : {
    //     CollectionPath               : 'WorkItems',
    //     Parameters                   : [{
    //         $Type             : 'Common.ValueListParameterInOut',
    //         LocalDataProperty : 'customer_ID',
    //         ValueListProperty : 'customer_ID'
    //     }],
    //     PresentationVariantQualifier : 'DurationByCustomer'
    // };
    customerName       @Common.ValueList : {
        CollectionPath               : 'WorkItems',
        Parameters                   : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'customerName',
            ValueListProperty : 'customerName'
        }],
        PresentationVariantQualifier : 'DurationByCustomer'
    };
    projectTitle       @Common.ValueList : {
        CollectionPath : 'WorkItems',
        Parameters     : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'projectTitle',
            ValueListProperty : 'projectTitle'
        }],
    // PresentationVariantQualifier : 'Default'
    };
    activatedDateMonth @Common.ValueList : {
        CollectionPath               : 'WorkItems',
        Parameters                   : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'activatedDateMonth',
            ValueListProperty : 'activatedDateMonth'
        }],
        PresentationVariantQualifier : 'DurationByMonth'
    };
    assignedToName     @Common.ValueList : {
        CollectionPath               : 'WorkItems',
        Parameters                   : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'assignedToName',
            ValueListProperty : 'assignedToName'
        }],
        PresentationVariantQualifier : 'DurationByAssignedTo'
    }
};
