using {TimetrackingService as my} from './timetracking-service';

annotate my.MyWorkItems with @(UI : {
  // =====================================================
  // Default
  //
  SelectionPresentationVariant : {
    $Type               : 'UI.SelectionPresentationVariantType',
    SelectionVariant    : {
      $Type : 'UI.SelectionVariantType',
      Text  : 'Hi',
    },
    PresentationVariant : ![@UI.PresentationVariant]
  },
  PresentationVariant          : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{
      Property   : date,
      Descending : true,
    }],
    GroupBy        : [date],
    Visualizations : ['@UI.Chart'],
  },

  // =====================================================
  // Table config
  //
  SelectionFields              : [
    activatedDate,
    assignedToUserPrincipalName,
    level0,
    level1,
    level2,
    level3,
    activatedDateMonth
  ],
  LineItem                     : [
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
  activatedDateMonth          @Common.ValueList : {
    CollectionPath               : 'MyWorkItems',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : 'activatedDateMonth',
      ValueListProperty : 'activatedDateMonth'
    }],
    PresentationVariantQualifier : 'DurationByMonth'
  };
  assignedToUserPrincipalName @Common.ValueList : {
    CollectionPath               : 'MyWorkItems',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : 'assignedToUserPrincipalName',
      ValueListProperty : 'assignedToUserPrincipalName'
    }],
    PresentationVariantQualifier : 'DurationByAssignedTo'
  };
  level0                      @(
    Common.Text      : {
      $value                 : level0Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    Common.ValueList : {
      CollectionPath : 'CategoriesLevel0',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0',
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'title'
        }
      ],
    }
  );
  level1                      @(
    Common.Text      : {
      $value                 : level1Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    Common.ValueList : {
      CollectionPath : 'CategoriesLevel1',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level1',
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0',
          ValueListProperty : 'level0'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0Title',
          ValueListProperty : 'level0Title'
        },
      // {
      //   $Type             : 'Common.ValueListParameterDisplayOnly',
      //   ValueListProperty : 'title'
      // }
      ],
    }
  );
  level2                      @(
    Common.Text      : {
      $value                 : level2Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    Common.ValueList : {
      CollectionPath : 'CategoriesLevel2',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level2',
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level1',
          ValueListProperty : 'level1'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level1Title',
          ValueListProperty : 'level1Title'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0',
          ValueListProperty : 'level0'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0Title',
          ValueListProperty : 'level0Title'
        },
      ],
    }
  );
  level3                      @(
    Common.Text      : {
      $value                 : level2Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    Common.ValueList : {
      CollectionPath : 'CategoriesLevel3',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level3',
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level2',
          ValueListProperty : 'level2'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level2Title',
          ValueListProperty : 'level2Title'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level1',
          ValueListProperty : 'level1'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level1Title',
          ValueListProperty : 'level1Title'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0',
          ValueListProperty : 'level0'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0Title',
          ValueListProperty : 'level0Title'
        },
      ],
    }
  );
};
