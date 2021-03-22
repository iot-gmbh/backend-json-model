using {iot.planner as my} from './schema';

annotate my.WorkItems with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>WorkItem}',
        TypeNamePlural : '{i18n>WorkItems}',
        Title          : {Value : Title},
    },
    Identification  : [
        {Value : Title},
        {Value : WorkItemType},
        {Value : CreatedDate},
        {Value : ChangedDate},
        {Value : OriginalEstimate},
        {Value : CompletedWork},
        {Value : Reason},
        {Value : State},
    ],
    SelectionFields : [
        Title,
        AssignedTo_ID
    ],
    LineItem        : [
        {
            $Type : 'UI.DataField',
            Value : Title,
        },
        {
            $Type : 'UI.DataField',
            Value : WorkItemType,
        },
        {
            $Type : 'UI.DataField',
            Value : OriginalEstimate,
        },
        {
            $Type : 'UI.DataField',
            Value : CompletedWork,
        },
        {
            $Type : 'UI.DataField',
            Value : Reason
        },
        {
            $Type : 'UI.DataField',
            Value : State
        },
        {
            $Type : 'UI.DataField',
            Value : CreatedDate
        },
        {
            $Type : 'UI.DataField',
            Value : CompletedDate,
        },
    ]
});

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
                           @cds.odata.valuelist {
    ID @UI.Hidden;
};

annotate my.Customers with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>Customer}',
        TypeNamePlural : '{i18n>Customers}',
        Title          : {Value : name},

    },
    Identification  : [{Value : name}],
    SelectionFields : [name, ],
    LineItem        : [{
        $Type : 'UI.DataField',
        Value : name,
    }, ]
})
                           @cds.odata.valuelist {
    ID @UI.Hidden;
};

annotate my.Tasks with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>Task}',
        TypeNamePlural : '{i18n>Tasks}',
        Title          : {Value : title},
        Description    : {Value : description},
    },
    Identification  : [
        {Value : dueDate},
        {Value : beginDate},
        {Value : effort},
        {Value : estimate},
        {Value : project_ID},
        {Value : personResponsible_ID}
    ],
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
            Value : project.title,
            Label : '{i18n>Tasks.project}'
        },
        {
            $Type : 'UI.DataField',
            Value : personResponsible.name,
            Label : '{i18n>Tasks.personResponsible}'
        },
        {
            $Type : 'UI.DataField',
            Value : beginDate,
        },
        {
            $Type : 'UI.DataField',
            Value : dueDate,
        },
        {
            $Type : 'UI.DataField',
            Value : effort,
        },
        {
            $Type : 'UI.DataField',
            Value : estimate,
        },
    ]
})
                       @cds.odata.valuelist {
    ID                @UI.Hidden;
    project           @(Common : {
        Text         : {
            $value                 : project.title,
            ![@UI.TextArrangement] : #TextOnly
        },
        FieldControl : #Mandatory
    });
    personResponsible @(Common : {
        Text         : {
            $value                 : personResponsible.name,
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
    Facets          : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.Identification'
    }, ],
    Identification  : [{Value : customer_ID}, ],
    SelectionFields : [
        title,
        description,
        customer_ID
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
            Label : '{i18n>Projects.customer}',
            Value : customer.name,
        },
    ]
})
                          @cds.odata.valuelist {
    ID       @UI.Hidden;
    customer @(Common : {
        Text         : {
            $value                 : customer.name,
            ![@UI.TextArrangement] : #TextOnly
        },
        FieldControl : #Mandatory
    });
};
