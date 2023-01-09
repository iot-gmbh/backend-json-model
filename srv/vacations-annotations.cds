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
  UI.ConnectedFields #vacationDates : {
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
  UI.HeaderInfo                     : {
    TypeName       : '{i18n>Vacations.vacation}',
    TypeNamePlural : '{i18n>Vacations.vacations}',
    Title          : {
      $Type  : 'UI.DataFieldForAnnotation',
      Target : ![@UI.ConnectedFields#vacationDates]
    }
  },
  UI.FieldGroup #Header             : {
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
  UI.FieldGroup #User               : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      {
        $Type : 'UI.DataField',
        Value : user_userPrincipalName,
        Label : '{i18n>Vacations.userPrincipalName}'
      },
      {
        $Type : 'UI.DataField',
        Value : user.displayName,
        Label : '{i18n>Vacations.userDisplayName}'
      },
      {
        $Type : 'UI.DataField',
        Value : user.vacDaysRemaining,
        Label : '{i18n>Vacations.vacDaysRemaining}'
      },
      {
        $Type : 'UI.DataField',
        Value : user.vacDaysTotal,
        Label : '{i18n>Vacations.vacDaysTotal}'
      }
    ],
  },
  UI.FieldGroup #Dates              : {
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
  UI.Facets                         : [
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
  userPrincipalName @Common.Label        : '{i18n>Vacations.userPrincipalName}';
  displayName       @Common.FieldControl : #ReadOnly;
  vacDaysRemaining  @odata.Type          : 'Edm.String'  @Core.Computed : true;
  vacDaysTotal      @odata.Type          : 'Edm.String'  @Core.Computed : true;
};
