using BillingService as my from './billing-service';

annotate my.MyWorkItems with @(UI : {
  HeaderInfo                                 : {
    TypeName       : '{i18n>Billing.Item}',
    TypeNamePlural : '{i18n>Billing.Items}'
  },
  LineItem                                   : [
    {
      $Type : 'UI.DataField',
      Value : workDate,
    },
    {
      $Type : 'UI.DataField',
      Value : startTime,
    },
    {
      $Type : 'UI.DataField',
      Value : endTime,
    },
    {
      $Type : 'UI.DataField',
      Value : duration,
    },
    {
      $Type : 'UI.DataField',
      Value : title,
    },
    {
      $Type : 'UI.DataField',
      Value : customerText,
    },
    {
      $Type : 'UI.DataField',
      Value : projectText,
    },
    {
      $Type : 'UI.DataField',
      Value : subProjectText,
    },
    {
      $Type : 'UI.DataField',
      Value : workPackageText,
    },
    {
      $Type : 'UI.DataField',
      Value : location,
    },
  ]
});
