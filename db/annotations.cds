using {iot.planner as my} from './schema';

annotate my.WorkItems with @(UI : {
    // The Sort order is not evaluated by responsive tables (by design)
    // See: https://sapui5.hana.ondemand.com/#/api/sap.ui.comp.smarttable.SmartTable%23annotations/PresentationVariant
    PresentationVariant : {
        $Type     : 'UI.PresentationVariantType',
        SortOrder : [{
            Descending : true,
            Property   : completedDate,
        }]
    },
    Identification      : [
        {Value : title},
        {Value : assignedTo.displayName, },
        {Value : customer.name, },
        {Value : project.title, },
        {Value : activatedDate},
        {Value : completedDate, },
    ],
    SelectionFields     : [
        title,
        assignedTo_userPrincipalName,
        customer_friendlyID,
        project_friendlyID,
        activatedDate,
        completedDate
    ],
    LineItem            : [
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

@cds.odata.valuelist
annotate my.Users with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>User}',
        TypeNamePlural : '{i18n>Users}',
        Title          : {Value : userPrincipalName},
    },
    Identification  : [
        {Value : displayName},
        {Value : jobTitle},
        {Value : manager_userPrincipalName},
    ],
    SelectionFields : [
        manager_userPrincipalName,
        userPrincipalName,
        displayName,
    ],
    Facets          : [
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Identification}',
            Target : '@UI.Identification'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Users.teamMembers}',
            Target : 'teamMembers/@UI.LineItem'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Users.projects}',
            Target : 'projects/@UI.LineItem'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Users.managedProjects}',
            Target : 'managedProjects/@UI.LineItem'
        },
    ],
    LineItem        : [
        {
            $Type : 'UI.DataField',
            Value : userPrincipalName,
        },
        {
            $Type : 'UI.DataField',
            Value : displayName,
        },
        {
            $Type : 'UI.DataField',
            Value : jobTitle,
        },
        {
            $Type : 'UI.DataField',
            Value : manager_userPrincipalName,
        },
    ]
}) {
    ID      @UI.Hidden;
    manager @(Common : {
        Text         : {
            $value                 : manager.displayName,
            ![@UI.TextArrangement] : #TextOnly
        },
        FieldControl : #Mandatory
    });
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

@cds.odata.valuelist
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
            Label  : '{i18n>Projects.teamMembers}',
            Target : 'teamMembers/@UI.LineItem'
        },
    ],
    Identification  : [
        {Value : friendlyID},
        {Value : customer_ID},
        {Value : manager_userPrincipalName},
        {Value : IOTProjectID},
    ],
    SelectionFields : [
        title,
        description,
        customer_ID,
        manager_userPrincipalName
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
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Projects.manager}',
            Value : manager.displayName,
        },
        {
            $Type : 'UI.DataField',
            Value : IOTProjectID,
        },
    ]
}) {
    ID       @UI.Hidden;
    customer @(Common : {
        Text         : {
            $value                 : customer.name,
            ![@UI.TextArrangement] : #TextOnly
        },
        FieldControl : #Mandatory
    });
};

@cds.odata.valuelist
annotate my.Users2Projects with @(UI : {
    HeaderInfo      : {
        TypeName       : '{i18n>User2Project}',
        TypeNamePlural : '{i18n>Users2Projects}',
        Title          : {Value : user.displayName},
        Description    : {Value : project.title},
    },
    Facets          : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.Identification'
    }, ],
    Identification  : [
        {Value : user_userPrincipalName},
        {Value : project_ID},
    ],
    SelectionFields : [
        user_userPrincipalName,
        project_ID,
    ],
    LineItem        : [
        {
            $Type : 'UI.DataField',
            Value : user_userPrincipalName,
        },
        {
            $Type : 'UI.DataField',
            Value : project_ID,
        },
    ]
}) {
    ID      @UI.Hidden;
    project @(Common : {
        Text         : {
            $value                 : project.title,
            ![@UI.TextArrangement] : #TextOnly
        },
        FieldControl : #Mandatory
    });
    user    @(Common : {
        Text         : {
            $value                 : user.displayName,
            ![@UI.TextArrangement] : #TextOnly
        },
        FieldControl : #Mandatory
    });
};
