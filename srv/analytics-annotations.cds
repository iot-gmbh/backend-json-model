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
            Dimension : project_ID,
            Role      : #Category
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [
            customer.name,
            project.title
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
            Dimension : customer.name,
            Role      : #Category
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [customer.name],
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
            Dimension : assignedTo.displayName,
            Role      : #Category
        }, ],
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : duration,
            Role    : #Axis1
        }],
        Dimensions          : [assignedTo_userPrincipalName],
        Measures            : [duration],
    },
    SelectionFields                           : [
        activatedDate,
        completedDate,
        activatedDateMonth,
        assignedTo_userPrincipalName,
        customer.name,
        project.title,
    ],
    LineItem                                  : [
        {
            $Type : 'UI.DataField',
            Value : assignedTo.displayName,
        },
        {
            $Type : 'UI.DataField',
            Value : customer.name,
        },
        {
            $Type : 'UI.DataField',
            Value : project.title,
        },
        {
            $Type : 'UI.DataField',
            Value : duration,
        },
    ]
}) {
    customer_friendlyID          @Common.ValueList : {
        CollectionPath               : 'WorkItems',
        Parameters                   : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'customer_friendlyID',
            ValueListProperty : 'customer_friendlyID'
        }],
        PresentationVariantQualifier : 'DurationByCustomer'
    };
    project_friendlyID           @Common.ValueList : {
        CollectionPath : 'WorkItems',
        Parameters     : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'project_friendlyID',
            ValueListProperty : 'project_friendlyID'
        }],
    // PresentationVariantQualifier : 'Default'
    };
    activatedDateMonth           @Common.ValueList : {
        CollectionPath               : 'WorkItems',
        Parameters                   : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'activatedDateMonth',
            ValueListProperty : 'activatedDateMonth'
        }],
        PresentationVariantQualifier : 'DurationByMonth'
    };
    assignedTo_userPrincipalName @Common.ValueList : {
        CollectionPath               : 'WorkItems',
        Parameters                   : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : 'assignedTo_userPrincipalName',
            ValueListProperty : 'assignedTo_userPrincipalName'
        }],
        PresentationVariantQualifier : 'DurationByAssignedTo'
    }
};
