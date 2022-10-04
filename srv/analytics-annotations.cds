using {AnalyticsService as my} from './analytics-service';

annotate my.Categories with @(UI : {
  // =====================================================
  // Default
  //
  SelectionPresentationVariant : {
    $Type               : 'UI.SelectionPresentationVariantType',
    SelectionVariant    : {$Type : 'UI.SelectionVariantType',

    },
    PresentationVariant : {$Type : 'UI.PresentationVariantType',

    },
  },
  PresentationVariant #ALP     : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{
      Property   : duration,
      Descending : true,
    }],
    Visualizations : ['@UI.Chart#ALP'],
  },
  Chart #ALP                   : {
    $Type               : 'UI.ChartDefinitionType',
    ChartType           : #Column,
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : assignedToUserPrincipalName,
      Role      : #Category
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
  // Table config
  //
  SelectionFields              : [
    activatedDate,
    completedDate,
    assignedToUserPrincipalName,
    activatedDateMonth,
  // title,
  ],
  LineItem                     : [
    {
      $Type : 'UI.DataField',
      Value : assignedToUserPrincipalName,
    },
    {
      $Type : 'UI.DataField',
      Value : duration,
    },
  ]
}) {
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
