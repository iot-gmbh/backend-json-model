using {LeavesService as my} from './leaves-service';

annotate my.Leaves with @(
  odata.draft.enabled,
  SelectionPresentationVariant : {
    $Type               : 'UI.SelectionPresentationVariantType',
    PresentationVariant : ![@UI.PresentationVariant]
  },
  UI.PresentationVariant       : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : startDate,
      Descending : true,
    }, ],
    Visualizations : ['@UI.LineItem', ],
  },
  UI.LineItem                  : [
    {
      $Type : 'UI.DataField',
      Value : user_userPrincipalName
    },
    {
      $Type : 'UI.DataField',
      Value : startDate
    },
    {
      $Type : 'UI.DataField',
      Value : endDate
    },
    {
      $Type : 'UI.DataField',
      Value : durationInDays
    },
  ],
  UI.SelectionFields           : [
    user_userPrincipalName,
    startDate,
    endDate
  ]
) {
  durationInDays @Core.Computed : true;
};

annotate my.Leaves with @(
  UI.ConnectedFields #leaveDates : {
    $Type    : 'UI.ConnectedFieldsType',
    Template : '{start} - {end}',
    Data     : {
      start : {
        $Type : 'UI.DataField',
        Value : startDate
      },
      end   : {
        $Type : 'UI.DataField',
        Value : endDate,
      },
    },
  },
  UI.HeaderInfo                  : {
    TypeName       : '{i18n>Leaves.leave}',
    TypeNamePlural : '{i18n>Leaves.leaves}',
    Title          : {
      $Type  : 'UI.DataFieldForAnnotation',
      Target : ![@UI.ConnectedFields#leaveDates]
    }
  },
  UI.FieldGroup #Header          : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type : 'UI.DataField',
        Value : startDate
      },
      {
        $Type : 'UI.DataField',
        Value : endDate
      }
    ]
  },
  UI.FieldGroup #User            : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type : 'UI.DataField',
        Value : user_userPrincipalName,
        Label : '{i18n>Leaves.userPrincipalName}'
      },
      {
        $Type : 'UI.DataField',
        Value : user.displayName,
        Label : '{i18n>Leaves.userDisplayName}'
      },
      {
        $Type : 'UI.DataField',
        Value : user.vacDaysRemaining,
        Label : '{i18n>Leaves.vacDaysRemaining}'
      },
      {
        $Type : 'UI.DataField',
        Value : user.vacDaysTotal,
        Label : '{i18n>Leaves.vacDaysTotal}'
      }
    ],
  },
  UI.FieldGroup #Dates           : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type : 'UI.DataField',
        Value : startDate
      },
      {
        $Type : 'UI.DataField',
        Value : endDate
      },
      {
        $Type : 'UI.DataField',
        Value : durationInDays
      }
    ],
  },
  UI.Facets                      : [
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Leaves.dates}',
      Target : '@UI.FieldGroup#Dates',
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Leaves.user}',
      Target : '@UI.FieldGroup#User',
    },
  ]
);

annotate my.Leaves with @(
  Common.SideEffects #updateAfterStartChange    : {
    SourceProperties : ['startDate'],
    TargetProperties : ['durationInDays'],
  },
  Common.SideEffects #updateAfterEndChange      : {
    SourceProperties : ['endDate'],
    TargetProperties : ['durationInDays'],
  },
  Common.SideEffects #updateAfterDurationChange : {
    SourceProperties : ['durationInDays'],
    TargetProperties : [
      'user/vacDaysRemaining',
      'user/vacDaysTotal'
    ]
  },
  Common.SideEffects #updateAfterUserSelection  : {
    SourceProperties : ['user_userPrincipalName'],
    TargetProperties : [
      'user/displayName',
      'user/vacDaysRemaining',
      'user/vacDaysTotal'
    ]
  }
);

annotate my.Users with {
  userPrincipalName @Common.Label        : '{i18n>Leaves.userPrincipalName}';
  displayName       @Common.FieldControl : #ReadOnly;
  vacDaysRemaining  @odata.Type          : 'Edm.String'  @Core.Computed : true;
  vacDaysTotal      @odata.Type          : 'Edm.String'  @Core.Computed : true;
};
