using {AdminService as my} from './admin-service';

annotate my.ProjectsPerUser with @(UI : {LineItem : [{
  $Type : 'UI.DataField',
  Value : project_ID,
}]}) {
  ID @UI.Hidden;
};

annotate my.UsersPerProject with @(UI : {
  HeaderInfo     : {
    TypeName       : '{i18n>UsersPerProject}',
    TypeNamePlural : '{i18n>UsersPerProjects}',
    Title          : {Value : user_userPrincipalName}
  },
  Facets         : [{
    $Type  : 'UI.ReferenceFacet',
    Label  : '{i18n>General}',
    Target : '@UI.Identification'
  }, ],
  Identification : [{Value : user_userPrincipalName}, ],
  LineItem       : [{
    $Type : 'UI.DataField',
    Value : user_userPrincipalName,
  }]
}) {
  ID @UI.Hidden;
};

annotate my.UsersToCategories with @(UI : {
  HeaderInfo     : {
    TypeName       : '{i18n>UsersPerProject}',
    TypeNamePlural : '{i18n>UsersPerProjects}',
    Title          : {Value : title}
  },
  Facets         : [{
    $Type  : 'UI.ReferenceFacet',
    Label  : '{i18n>General}',
    Target : '@UI.Identification'
  }, ],
  Identification : [
    {Value : title},
    {Value : users},
  ],
  LineItem       : [
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
      Value : users,
    }
  ]
}) {
  ID @UI.Hidden;
}
