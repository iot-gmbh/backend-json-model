using {VacationsService as my} from './vacations-service';

annotate my.Vacations with @(
  odata.draft.enabled,
  UI.LineItem        : [
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
  UI.SelectionFields : [
    user_userPrincipalName,
    startDate,
    endDate
  ]
) {
  durationInDays @Core.Computed : true;
};

annotate my.Vacations with @(
  UI.HeaderInfo        : {
    TypeName       : '{i18n>Vacations.user}',
    TypeNamePlural : '{i18n>Vacations.user}',
    Title          : {Value : user_userPrincipalName},
  },
  UI.FieldGroup #User  : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type : 'UI.DataField',
        Value : user_userPrincipalName,
        Label : 'Principal Name'
      },
      {
        $Type : 'UI.DataField',
        Value : user.displayName,
        Label : 'Name'
      },
      {
        $Type : 'UI.DataField',
        Value : user.vacDaysRemaining,
        Label : 'Vacation Days Remaining'
      },
      {
        $Type : 'UI.DataField',
        Value : user.vacDaysTotal,
        Label : 'Vacation Days Spent'
      }
    ],
  },
  UI.FieldGroup #Dates : {
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
  UI.Facets            : [
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Vacations.dates}',
      Target : '@UI.FieldGroup#Dates',
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : '{i18n>Vacations.user}',
      Target : '@UI.FieldGroup#User',
    },
  ]
);

annotate my.Vacations with @(
  Common.SideEffects #updateAfterStartChange : {
    SourceProperties : ['startDate'],
    TargetProperties : ['durationInDays'],
  },
  Common.SideEffects #updateAfterEndChange   : {
    SourceProperties : ['endDate'],
    TargetProperties : ['durationInDays'],
  },
  Common.SideEffects #updateAfterDurationChange : {
    SourceProperties : ['durationInDays'],
    TargetProperties : ['user/vacDaysRemaining', 'user/vacDaysTotal']
  },
  Common.SideEffects #updateAfterUserSelection : {
    SourceProperties : ['user_userPrincipalName'],
    TargetProperties : [
      'user/displayName',
      'user/vacDaysRemaining',
      'user/vacDaysTotal'
    ]
  }
);

annotate my.Users with {
  userPrincipalName @Common.Label        : 'Principal Name';
  displayName       @Common.FieldControl : #ReadOnly;
  vacDaysRemaining  @odata.Type          : 'Edm.String'  @Core.Computed : true;
  vacDaysTotal      @odata.Type          : 'Edm.String'  @Core.Computed : true;
};
