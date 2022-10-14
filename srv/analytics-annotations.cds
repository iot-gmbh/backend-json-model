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
    assignedToUserPrincipalName,
    level0Title,
    level1Title,
    level2Title,
    level3Title,
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
  level0Title                 @Common.ValueList : {
    CollectionPath : 'Customers',
    Parameters     : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : 'level0Title',
      ValueListProperty : 'title'
    }],
  };
  level1Title                 @Common.ValueList : {
    CollectionPath : 'Projects',
    Parameters     : [
      {
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level1Title',
        ValueListProperty : 'title'
      },
      {
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level0Title',
        ValueListProperty : 'customerTitle'
      }
    ],
  };
  level2Title                 @Common.ValueList : {
    CollectionPath : 'SubProjects',
    Parameters     : [
      {
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level2Title',
        ValueListProperty : 'title'
      },
      {
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level1Title',
        ValueListProperty : 'projectTitle'
      },
      {
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level0Title',
        ValueListProperty : 'customerTitle'
      }
    ],
  };
  level3Title                 @Common.ValueList : {
    CollectionPath : 'Packages',
    Parameters     : [
      {
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level3Title',
        ValueListProperty : 'title'
      },
      {
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level2Title',
        ValueListProperty : 'subProjectTitle'
      },
      {
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level1Title',
        ValueListProperty : 'projectTitle'
      },
      {
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level0Title',
        ValueListProperty : 'customerTitle'
      }
    ],
  };
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
