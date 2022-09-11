using WorkItemsService as my from './work-items-service';

annotate my.IOTWorkItems with @(UI : {
  HeaderInfo          : {
    TypeName       : '{i18n>IOTWorkItem}',
    TypeNamePlural : '{i18n>IOTWorkItems}',
    Title          : {Value : Taetigkeit},
  },
  PresentationVariant : {
    $Type          : 'UI.PresentationVariantType',
    SortOrder      : [{
      Property   : Datum,
      Descending : true,
    }],
    Visualizations : ['@UI.LineItem'],
    RequestAtLeast : ['Datum']
  },
  SelectionFields     : [
    Datum,
    Beginn,
    Ende,
    Taetigkeit,
    Nutzer,
    Bemerkung
  ],
  LineItem            : [
    {
      $Type : 'UI.DataField',
      Value : Datum,
    },
    {
      $Type : 'UI.DataField',
      Value : Beginn,
    },
    {
      $Type : 'UI.DataField',
      Value : Ende,
    },
    {
      $Type : 'UI.DataField',
      Value : Bemerkung,
    },
    {
      $Type : 'UI.DataField',
      Value : ProjektAlias,
    },
    {
      $Type : 'UI.DataField',
      Value : TeilprojektAlias,
    },
    {
      $Type : 'UI.DataField',
      Value : ArbeitspaketAlias,
    },
    {
      $Type : 'UI.DataField',
      Value : Taetigkeit,
    },
    {
      $Type : 'UI.DataField',
      Value : Nutzer,
    },
    {
      $Type : 'UI.DataField',
      Value : Einsatzort,
    },
  ]
});
