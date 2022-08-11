using {AnalyticsService as my} from './analytics-service';

annotate my.Categories with @(UI : {

  // =====================================================
  // Default
  //
  PresentationVariant                       : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{
      Property   : duration,
      Descending : true,
    }],
    Visualizations : ['@UI.Chart'],
  },
  Chart                                     : {
    $Type               : 'UI.ChartDefinitionType',
    ChartType           : #Column,
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : parentTitle,
      Role      : #Category
    }, ],
    MeasureAttributes   : [{
      $Type   : 'UI.ChartMeasureAttributeType',
      Measure : duration,
      Role    : #Axis1
    }],
    Dimensions          : [parentTitle],
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
    parentTitle,
  ],
  LineItem                                  : [
    {
      $Type : 'UI.DataField',
      Value : assignedToUserPrincipalName,
    },
    {
      $Type : 'UI.DataField',
      Value : parentTitle,
    },
    {
      $Type : 'UI.DataField',
      Value : duration,
    },
  ]
}) {
  parentTitle                 @Common.ValueList : {
    CollectionPath               : 'Categories',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : 'parentTitle',
      ValueListProperty : 'ID'
    }],
    PresentationVariantQualifier : 'DurationByCategory'
  };
  activatedDateMonth          @Common.ValueList : {
    CollectionPath               : 'Categories',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : 'activatedDateMonth',
      ValueListProperty : 'activatedDateMonth'
    }],
    PresentationVariantQualifier : 'DurationByMonth'
  };
  assignedToUserPrincipalName @Common.ValueList : {
    CollectionPath               : 'Categories',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : 'assignedToUserPrincipalName',
      ValueListProperty : 'assignedToUserPrincipalName'
    }],
    PresentationVariantQualifier : 'DurationByAssignedTo'
  }
};

// annotate my.Categories with @(UI : {

//   // =====================================================
//   // Default
//   //
//   PresentationVariant : {
//     $Type          : 'UI.PresentationVariantType',
//     SortOrder      : [{
//       Descending : true,
//       Property   : duration,
//     }],
//     Visualizations : ['@UI.Chart'],
//   },
//   Chart               : {
//     $Type               : 'UI.ChartDefinitionType',
//     ChartType           : #Column,
//     DimensionAttributes : [{
//       $Type     : 'UI.ChartDimensionAttributeType',
//       Dimension : parentTitle,
//       Role      : #Category
//     }, ],
//     MeasureAttributes   : [{
//       $Type   : 'UI.ChartMeasureAttributeType',
//       Measure : duration,
//       Role    : #Axis1
//     }],
//     Dimensions          : [parentTitle],
//     Measures            : [duration],
//   },
// })
//
