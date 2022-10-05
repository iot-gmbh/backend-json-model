using {AnalyticsService as my} from './analytics-service';

annotate my.WorkItems with @(UI : {

  // =====================================================
  // Default
  //
  SelectionPresentationVariant              : {
    $Type               : 'UI.SelectionPresentationVariantType',
    SelectionVariant    : {
      $Type : 'UI.SelectionVariantType',
      Text  : 'Hi',
    },
    PresentationVariant : ![@UI.PresentationVariant]
  },
  PresentationVariant                       : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{
      Property   : date,
      Descending : true,
    }],
    GroupBy        : [date],
    Visualizations : ['@UI.Chart'],
  },
  Chart                                     : {
    $Type               : 'UI.ChartDefinitionType',
    ChartType           : #Column,
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : level0Title,
      Role      : #Category
    }, ],
    MeasureAttributes   : [{
      $Type   : 'UI.ChartMeasureAttributeType',
      Measure : duration,
      Role    : #Axis1
    }],
    Dimensions          : [level0Title],
    Measures            : [duration],
  },

  // =====================================================
  // Duration by Month
  //
  PresentationVariant #DurationByMonth      : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{
      Property   : duration,
      Descending : true,
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
      Property   : duration,
      Descending : true,
    }],
    Visualizations : ['@UI.Chart#DurationByAssignedTo', ],
  },
  Chart #DurationByAssignedTo               : {
    $Type               : 'UI.ChartDefinitionType',
    ChartType           : #Column,
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : assignedToUserPrincipalName,
      Role      : #Series
    }, ],
    MeasureAttributes   : [{
      $Type   : 'UI.ChartMeasureAttributeType',
      Measure : duration,
      Role    : #Axis1
    }],
    Dimensions          : [assignedToUserPrincipalName],
    Measures            : [duration],
  },

  // =====================================================
  // Duration by Category
  //
  PresentationVariant #DurationByCategory   : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{
      Property   : duration,
      Descending : true,
    }],
    Visualizations : ['@UI.Chart'],
  },

  // =====================================================
  // Table config
  //
  SelectionFields                           : [
    activatedDate,
    completedDate,
    assignedToUserPrincipalName,
    activatedDateMonth,
  ],
  LineItem                                  : [
    {
      $Type : 'UI.DataField',
      Value : date,
    },
    {
      $Type : 'UI.DataField',
      Value : duration,
    },
  ]
}) {
  // category                    @Common.ValueList : {
  //   CollectionPath               : 'WorkItems',
  //   Parameters                   : [{
  //     $Type             : 'Common.ValueListParameterInOut',
  //     LocalDataProperty : 'category',
  //     ValueListProperty : 'ID'
  //   }],
  //   PresentationVariantQualifier : 'DurationByCategory'
  // };
  activatedDateMonth          @Common.ValueList : {
    CollectionPath               : 'WorkItems',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : 'activatedDateMonth',
      ValueListProperty : 'activatedDateMonth'
    }],
    PresentationVariantQualifier : 'DurationByMonth'
  };
  assignedToUserPrincipalName @Common.ValueList : {
    CollectionPath               : 'WorkItems',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : 'assignedToUserPrincipalName',
      ValueListProperty : 'assignedToUserPrincipalName'
    }],
    PresentationVariantQualifier : 'DurationByAssignedTo'
  }
};
