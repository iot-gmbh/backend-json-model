using {iot.planner as my} from './schema';

// @cds.odata.valuelist
// annotate my.WorkItems with @(UI : {
//   HeaderInfo      : {
//     TypeName       : '{i18n>WorkItem}',
//     TypeNamePlural : '{i18n>WorkItems}',
//     Title          : {Value : title},
//   },
//   Identification  : [{Value : title}],
//   FieldGroup      : {
//     $Type : 'UI.FieldGroupType',
//     Label : '{i18n>Classification}',
//     Data  : [
//       {Value : title},
//       {Value : invoiceRelevance},
//       {Value : bonusRelevance},
//     ],
//   },
//   SelectionFields : [title, ],
//   LineItem        : [
//     {
//       $Type : 'UI.DataField',
//       Value : title,
//     },
//     {
//       $Type : 'UI.DataField',
//       Value : assignedTo_userPrincipalName,
//     },
//     {
//       $Type : 'UI.DataField',
//       Value : hierarchy.level0,
//     },
//     {
//       $Type : 'UI.DataField',
//       Value : hierarchy.level1,
//     },
//     {
//       $Type : 'UI.DataField',
//       Value : hierarchy.level2,
//     },
//     {
//       $Type : 'UI.DataField',
//       Value : hierarchy.level3,
//     },
//   ],
//   Facets          : [
//     {
//       $Type  : 'UI.ReferenceFacet',
//       Label  : '{i18n>Identification}',
//       Target : '@UI.Identification'
//     },
//     {
//       $Type  : 'UI.ReferenceFacet',
//       Label  : '{i18n>Identification}',
//       Target : '@UI.FieldGroup'
//     }
//   ]
// });

annotate my.hierarchies.Hierarchies with {
  level0 @(Common : {
    Text         : {
      $value                 : level0Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    FieldControl : #Mandatory
  });
  level1 @(Common : {
    Text         : {
      $value                 : level1Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    FieldControl : #Mandatory
  });
  level2 @(Common : {
    Text         : {
      $value                 : level2Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    FieldControl : #Mandatory
  });
  level3 @(Common : {
    Text         : {
      $value                 : level3Title,
      ![@UI.TextArrangement] : #TextOnly
    },
    FieldControl : #Mandatory
  });
};


@cds.odata.valuelist
annotate my.Users with @(UI : {
  PresentationVariant : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{
      Descending : true,
      Property   : displayName,
    }],
    Visualizations : ['@UI.LineItem'],
    RequestAtLeast : [displayName]
  },
  HeaderInfo          : {
    TypeName       : '{i18n>User}',
    TypeNamePlural : '{i18n>Users}',
    Title          : {Value : userPrincipalName},
  },
  Identification      : [
    {Value : userPrincipalName},
    {Value : displayName},
    {Value : jobTitle},
    {Value : manager_userPrincipalName},
  ],
  SelectionFields     : [
    displayName,
    userPrincipalName,
    manager_userPrincipalName,
  ],
  FieldGroup #Leave   : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {Value : yearlyVacDays},
      {Value : vacDaysTotal},
      {Value : vacDaysRemaining}
    ],
  },
  Facets              : [
    {
      $Type  : 'UI.CollectionFacet',
      Label  : '{i18n>Identification}',
      ID     : 'IdentificationFacet',
      Facets : [
        {
          $Type  : 'UI.ReferenceFacet',
          Label  : '{i18n>Identification}',
          Target : '@UI.Identification'
        },
        {
          $Type  : 'UI.ReferenceFacet',
          Label  : '{i18n>Leave}',
          Target : '@UI.FieldGroup#Leave'
        }
      ]
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Users.teamMembers}',
      Target : 'teamMembers/@UI.LineItem'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Leaves}',
      Target : 'leaves/@UI.LineItem'
    }
  ],
  LineItem            : [
    {
      $Type : 'UI.DataField',
      Value : userPrincipalName,
    },
    {
      $Type : 'UI.DataField',
      Value : displayName,
    },
    {
      $Type : 'UI.DataField',
      Value : jobTitle,
    },
    {
      $Type : 'UI.DataField',
      Value : manager_userPrincipalName,
    },
  ]
}) {
  ID      @UI.Hidden;
  manager @(Common : {
    Text         : {
      $value                 : manager.displayName,
      ![@UI.TextArrangement] : #TextOnly
    },
    FieldControl : #Mandatory
  });
};

annotate my.Categories with @(UI : {
  PresentationVariant   : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{Property : title}],
    Visualizations : ['@UI.LineItem'],
    RequestAtLeast : [title]
  },
  HeaderInfo            : {
    TypeName       : '{i18n>Category}',
    TypeNamePlural : '{i18n>Categories}',
    Title          : {Value : title},
    Description    : {Value : absoluteReference},
  },
  FieldGroup #Hierarchy : {
    $Type : 'UI.FieldGroupType',
    Label : '{i18n>Hierarchy}',
    Data  : [
      {Value : hierarchyLevel},
      {Value : parent_ID},
      {Value : drillDownState},
    ],
  },
  FieldGroup #Validity  : {
    $Type : 'UI.FieldGroupType',
    Label : '{i18n>Validity}',
    Data  : [
      {Value : validFrom},
      {Value : validTo},
    ],
  },
  Identification        : [
    {Value : title},
    {Value : absoluteReference},
  ],
  Facets                : [
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Identification}',
      Target : '@UI.Identification'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Identification}',
      Target : '@UI.FieldGroup#Hierarchy'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Identification}',
      Target : '@UI.FieldGroup#Validity'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Categories.children}',
      Target : 'children/@UI.LineItem'
    }
  ],
  SelectionFields       : [
    title,
    hierarchyLevel,
    validFrom,
    validTo
  ],
  LineItem              : [
    {
      $Type : 'UI.DataField',
      Value : title,
    },
    // {
    //   $Type : 'UI.DataField',
    //   Value : parent_ID,
    // },
    {
      $Type : 'UI.DataField',
      Value : absoluteReference,
    },
    {
      $Type : 'UI.DataField',
      Value : validFrom,
    },
    {
      $Type : 'UI.DataField',
      Value : validTo,
    }
  ]
}) {
  ID             @(
    UI.Hidden,
    sap.hierarchy.node.for : 'ID',
    Common.Text            : {
      $value                 : title,
      ![@UI.TextArrangement] : #TextOnly
    },
  );
  parent         @(
    sap.hierarchy.parent.node.for : 'ID',
    Common                        : {
      Text         : {
        $value                 : parent.title,
        ![@UI.TextArrangement] : #TextOnly
      },
      FieldControl : #Mandatory,
    }
  );
  hierarchyLevel @sap.hierarchy.level.for       : 'ID';
  drillDownState @sap.hierarchy.drill.state.for : 'ID';
}

annotate my.Leaves with @(UI.LineItem : [
  {
    $Type : 'UI.DataField',
    Value : startDate,
  },
  {
    $Type : 'UI.DataField',
    Value : endDate,
  },
  {
    $Type : 'UI.DataField',
    Value : durationInDays,
  },
]);
