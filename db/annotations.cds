using {iot.planner as my} from './schema';

annotate my.WorkItems with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>WorkItem}',
        TypeNamePlural : '{i18n>WorkItems}',
        Title          : {Value : title},
    },
    Identification  : [
        {Value : title},
        {Value : workItemType},
        {Value : createdDate},
        {Value : changedDate},
        {Value : originalEstimate},
        {Value : completedWork},
        {Value : reason},
        {Value : state},
    ],
    SelectionFields : [
        title,
        assignedTo_userPrincipalName
    ],
    LineItem        : [
        {
            $Type : 'UI.DataField',
            Value : title,
        },
        {
            $Type : 'UI.DataField',
            Value : workItemType,
        },
        {
            $Type : 'UI.DataField',
            Value : originalEstimate,
        },
        {
            $Type : 'UI.DataField',
            Value : completedWork,
        },
        {
            $Type : 'UI.DataField',
            Value : reason
        },
        {
            $Type : 'UI.DataField',
            Value : state
        },
        {
            $Type : 'UI.DataField',
            Value : createdDate
        },
        {
            $Type : 'UI.DataField',
            Value : completedDate,
        },
    ]
});

@cds.odata.valuelist
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
}) {
    ID @UI.Hidden;
};

@cds.odata.valuelist
annotate my.Customers with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>Customer}',
        TypeNamePlural : '{i18n>Customers}',
        Title          : {Value : name},
    },
    Identification  : [{Value : friendlyID}],
    SelectionFields : [name, ],
    LineItem        : [
        {
            $Type : 'UI.DataField',
            Value : name,
        },
        {
            $Type : 'UI.DataField',
            Value : friendlyID,
        },
    ],
    Facets          : [
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Identification}',
            Target : '@UI.Identification'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Customers.projects}',
            Target : 'projects/@UI.LineItem'
        }
    ]
}) {
    ID @UI.Hidden;
}

annotate my.Projects with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>Project}',
        TypeNamePlural : '{i18n>Projects}',
        Title          : {Value : title},
        Description    : {Value : description},
    },
    Facets          : [
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>General}',
            Target : '@UI.Identification'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Projects.workItems}',
            Target : 'workItems/@UI.LineItem'
        },
    ],
    Identification  : [{Value : friendlyID}, ],
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
            Value : friendlyID,
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
