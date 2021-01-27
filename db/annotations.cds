using {iot.planner as my} from './schema';

annotate my.Employees with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>Employee}',
        TypeNamePlural : '{i18n>Employees}',
        Title          : {Value : name},

    },
    Identification  : [{Value : name}],
    SelectionFields : [name, ],
    LineItem        : [{
        $Type : 'UI.DataField',
        Value : name,
    }, ]
})
                           @cds.odata.valuelist
                           @Communication : {Contact : {$Type : 'Communication.ContactType',

}, }

{
    ID @UI.Hidden;
};

annotate my.Tasks with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>Task}',
        TypeNamePlural : '{i18n>Tasks}',
        Title          : {Value : title},
        Description    : {Value : description},
    },
    Identification  : [{Value : project_ID}, ],
    Facets          : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.Identification'
    }, ],
    SelectionFields : [
    title,
    description
    ],
    LineItem        : [
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
        Value : begin,
    },
    {
        $Type : 'UI.DataField',
        Value : due,
    },
    {
        $Type : 'UI.DataField',
        Value : effort,
    },
    {
        $Type : 'UI.DataField',
        Value : estimate,
    },
    {
        $Type            : 'UI.DataField',
        Value            : project.title,
        ![@Common.Label] : '{i18n>Tasks.project}'
    },
    {
        $Type  : 'UI.DataFieldForAnnotation',
        Target : 'personResponsible/@Communication.Contact',
    },
    ]
})
                       @cds.odata.valuelist {
    ID      @UI.Hidden;
    project @(Common : {
        Text         : {
            $value                 : project.title,
            ![@UI.TextArrangement] : #TextOnly
        },
        FieldControl : #Mandatory
    });
};

annotate my.Projects with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>Project}',
        TypeNamePlural : '{i18n>Projects}',
        Title          : {Value : title},
        Description    : {Value : description},
    },
    Identification  : [
    {Value : title},
    {Value : description}
    ],
    SelectionFields : [
    title,
    description
    ],
    LineItem        : [
    {
        $Type : 'UI.DataField',
        Value : title,
    },
    {
        $Type : 'UI.DataField',
        Value : description,
    },
    ]
})
                          @cds.odata.valuelist {
    ID @UI.Hidden;
};
