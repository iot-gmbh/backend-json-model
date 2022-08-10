using {AnalyticsService as my} from './analytics-service';

annotate my.WorkItems with @(UI : {
  // =====================================================
  // Duration by Category
  //
  PresentationVariant #DurationByCategory   : {
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
      Dimension : parent_ID,
      Role      : #Category
    }, ],
    MeasureAttributes   : [{
      $Type   : 'UI.ChartMeasureAttributeType',
      Measure : duration,
      Role    : #Axis1
    }],
    Dimensions          : [parent_ID],
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
      Dimension : assignedTo_userPrincipalName,
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
    parent_ID,
  ],
  LineItem                                  : [
    {
      $Type : 'UI.DataField',
      Value : assignedTo_userPrincipalName,
    },
    {
      $Type : 'UI.DataField',
      Value : parent_ID,
    },
    {
      $Type : 'UI.DataField',
      Value : duration,
    },
  ]
}) {
  parent_ID                    @Common.ValueList : {
    CollectionPath               : 'Categories',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : 'parent_ID',
      ValueListProperty : 'ID'
    }],
    PresentationVariantQualifier : 'DurationByCategory'
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
