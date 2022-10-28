using {TimetrackingService as my} from './timetracking-service';

annotate my.MyWorkItems with @(
                               // Capabilities : {
                               //   Updatable : true,
                               //   Deletable : true,
                               // },
                             UI : {
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
    level0Title,
    level1Title,
    level2Title,
    level3Title,
    assignedToUserPrincipalName,
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
  level0Title
  @(
    sap.updatable    : true,
    sap.creatable    : true,
    Common.Text      : {
      $value                 : level0Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    Common.ValueList : {
      CollectionPath : 'CategoriesLevel0',
      Parameters     : [{
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'level0Title',
        ValueListProperty : 'title'
      }, ],
    }
  );
  level1Title

  @(
    Common.Text      : {
      $value                 : level1Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    Common.ValueList : {
      CollectionPath : 'CategoriesLevel1',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level1Title',
          ValueListProperty : 'title'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0Title',
          ValueListProperty : 'level0Title'
        },
      ],
    }
  );
  level2Title

  @(
    Common.Text      : {
      $value                 : level2Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    Common.ValueList : {
      CollectionPath : 'CategoriesLevel2',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level2Title',
          ValueListProperty : 'title'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level1Title',
          ValueListProperty : 'level1Title'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0Title',
          ValueListProperty : 'level0Title'
        },
      ],
    }
  );
  level3Title

  @(
    Common.Text      : {
      $value                 : level2Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    Common.ValueList : {
      CollectionPath : 'CategoriesLevel3',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level3Title',
          ValueListProperty : 'title'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level2Title',
          ValueListProperty : 'level2Title'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level1Title',
          ValueListProperty : 'level1Title'
        },
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : 'level0Title',
          ValueListProperty : 'level0Title'
        },
      ],
    }
  );
  assignedToUserPrincipalName

  @(
    Common.Text      : {
      $value                 : assignedToUserPrincipalName,
      ![@UI.TextArrangement] : #TextOnly
    },
    Common.ValueList : {
      CollectionPath : 'Users',
      Parameters     : [{
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'assignedToUserPrincipalName',
        ValueListProperty : 'userPrincipalName'
      }, ],
    }
  );
};
