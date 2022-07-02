using {iot.planner as my} from './schema';

@cds.odata.valuelist
annotate my.WorkItems with @(UI : {
  PresentationVariant : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{Property : title}],
    Visualizations : ['@UI.LineItem'],
    RequestAtLeast : [title]
  },
  HeaderInfo          : {
    TypeName       : '{i18n>Customer}',
    TypeNamePlural : '{i18n>Customers}',
    Title          : {Value : title},
  },
  Identification      : [{Value : title}],
  FieldGroup          : {
    $Type : 'UI.FieldGroupType',
    Label : '{i18n>Classification}',
    Data  : [
      {Value : title},
      {Value : invoiceRelevance},
      {Value : bonusRelevance},
    ],
  },
  SelectionFields     : [title, ],
  LineItem            : [
    {
      $Type : 'UI.DataField',
      Value : title,
    },
    {
      $Type : 'UI.DataField',
      Value : assignedTo_userPrincipalName,
    },
    {
      $Type : 'UI.DataField',
      Value : invoiceRelevance,
    },
    {
      $Type : 'UI.DataField',
      Value : bonusRelevance,
    },
  ],
  Facets              : [
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Identification}',
      Target : '@UI.Identification'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Identification}',
      Target : '@UI.FieldGroup'
    }
  ]
}) {
  ID @UI.Hidden;
}

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
    {Value : displayName},
    {Value : jobTitle},
    {Value : manager_userPrincipalName},
  ],
  SelectionFields     : [
    displayName,
    userPrincipalName,
    manager_userPrincipalName,
  ],
  Facets              : [
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Identification}',
      Target : '@UI.Identification'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Users.teamMembers}',
      Target : 'teamMembers/@UI.LineItem'
    },
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
  PresentationVariant : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{Property : title}],
    Visualizations : ['@UI.LineItem'],
    RequestAtLeast : [title]
  },
  HeaderInfo          : {
    TypeName       : '{i18n>Category}',
    TypeNamePlural : '{i18n>Categories}',
    Title          : {Value : title},
    Description    : {Value : description},
  },
  Facets              : [{
    $Type  : 'UI.ReferenceFacet',
    Label  : '{i18n>General}',
    Target : '@UI.Identification'
  }, ],
  Identification      : [
    {Value : title},
    {Value : description},
    {Value : parent_ID},
  ],
  SelectionFields     : [
    title,
    description,
  ],
  LineItem            : [
    {
      $Type : 'UI.DataField',
      Value : title,
    },
    {
      $Type : 'UI.DataField',
      Value : description,
    },
    {
      $Type : 'UI.DataField',
      Value : invoiceRelevance,
    },
    {
      $Type : 'UI.DataField',
      Value : bonusRelevance,
    },
  ]
}) {
  ID             @(
    UI.Hidden,
    sap.hierarchy.node.for : 'ID'
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
