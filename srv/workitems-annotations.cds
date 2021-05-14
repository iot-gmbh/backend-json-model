using WorkItemsService as my from './workitems-service';

annotate my.MyWorkItems with @(Capabilities.FilterRestrictions : {
    RequiresFilter     : true,
    RequiredProperties : [
        activatedDate,
        completedDate
    ],
});

annotate my.IOTWorkItems with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>IOTWorkItem}',
        TypeNamePlural : '{i18n>IOTWorkItems}',
        Title          : {Value : Taetigkeit},
    },
    SelectionFields : [
        Datum,
        Beginn,
        Ende,
        Projekt,
        Teilprojekt,
        Arbeitspaket,
        Taetigkeit,
        Bemerkung
    ],
    LineItem        : [
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
            Value : P1,
        },
        {
            $Type : 'UI.DataField',
            Value : Projekt,
        },
        {
            $Type : 'UI.DataField',
            Value : Teilprojekt,
        },
        {
            $Type : 'UI.DataField',
            Value : Arbeitspaket,
        },
        {
            $Type : 'UI.DataField',
            Value : Taetigkeit,
        },
        {
            $Type : 'UI.DataField',
            Value : Einsatzort,
        },
        {
            $Type : 'UI.DataField',
            Value : P2,
        },
        {
            $Type : 'UI.DataField',
            Value : Bemerkung,
        }
    ]
});
