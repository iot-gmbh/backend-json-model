using WorkItemsService as my from './workitems-service';

@Capabilities.FilterRestrictions : {
    RequiresFilter     : true,
    RequiredProperties : [
        activatedDate,
        completedDate
    ],
} annotate my.MyWorkItems with  @(UI : {
    Identification  : [
        {Value : title},
        {Value : assignedTo.displayName, },
        {Value : customer.name, },
        {Value : project.title, },
        {Value : activatedDate},
        {Value : completedDate, },
    ],
    SelectionFields : [
        title,
        assignedTo_userPrincipalName,
        customer_friendlyID,
        project_friendlyID,
        activatedDate,
        completedDate
    ],
    LineItem        : [
        {
            $Type : 'UI.DataField',
            Value : title,
        },
        {
            $Type : 'UI.DataField',
            Value : assignedTo.displayName,
        },
        {
            $Type : 'UI.DataField',
            Value : customer_friendlyID,
        },
        {
            $Type : 'UI.DataField',
            Value : project_friendlyID,
        },
        {
            $Type : 'UI.DataField',
            Value : activatedDate
        },
        {
            $Type : 'UI.DataField',
            Value : completedDate,
        },
    ]
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
