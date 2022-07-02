using {AdminService as my} from './admin-service';

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
