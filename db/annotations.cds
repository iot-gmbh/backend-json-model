using {iot.planner as my} from './schema';

@cds.odata.valuelist
annotate my.Users with @(UI : {
    PresentationVariant : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{
            Descending : true,
            Property   : displayName,
        }],
        Visualizations : ['@UI.LineItem'],
        RequestAtLeast : [displayName]
    },
    HeaderInfo          : {
        TypeName       : '{i18n>User}',
        TypeNamePlural : '{i18n>Users}',
        Title          : {Value : userPrincipalName},
    },
    Identification      : [
        {Value : displayName},
        {Value : jobTitle},
        {Value : manager_userPrincipalName},
    ],
    SelectionFields     : [
        displayName,
        userPrincipalName,
        manager_userPrincipalName,
    ],
    Facets              : [
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
        // {
        //     $Type  : 'UI.ReferenceFacet',
        //     Label  : '{i18n>Users.projects}',
        //     Target : 'projects/@UI.LineItem'
        // },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Users.managedProjects}',
            Target : 'managedProjects/@UI.LineItem'
        },
    ],
    LineItem            : [
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
    PresentationVariant : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{Property : name}],
        Visualizations : ['@UI.LineItem'],
        RequestAtLeast : [name]
    },
    HeaderInfo          : {
        TypeName       : '{i18n>Customer}',
        TypeNamePlural : '{i18n>Customers}',
        Title          : {Value : name},
    },
    Identification      : [{Value : name}],
    FieldGroup          : {
        $Type : 'UI.FieldGroupType',
        Label : '{i18n>Classification}',
        Data  : [
            {Value : friendlyID},
            {Value : invoiceRelevance},
            {Value : bonusRelevance},
        ],
    },
    SelectionFields     : [
        name,
    ],
    LineItem            : [
        {
            $Type : 'UI.DataField',
            Value : name,
        },
        {
            $Type : 'UI.DataField',
            Value : friendlyID,
        },
        {
            $Type : 'UI.DataField',
            Value : invoiceRelevance,
        },
        {
            $Type : 'UI.DataField',
            Value : bonusRelevance,
        },
    ],
    Facets              : [
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Identification}',
            Target : '@UI.Identification'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Identification}',
            Target : '@UI.FieldGroup'
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
    PresentationVariant : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{Property : title}],
        Visualizations : ['@UI.LineItem'],
        RequestAtLeast : [
            'title',
            'customer_ID'
        ]
    },
    HeaderInfo          : {
        TypeName       : '{i18n>Project}',
        TypeNamePlural : '{i18n>Projects}',
        Title          : {Value : title},
        Description    : {Value : description},
    },
    Facets              : [
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>General}',
            Target : '@UI.Identification'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Classification}',
            Target : '@UI.FieldGroup'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Projects.teamMembers}',
            Target : 'teamMembers/@UI.LineItem'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Projects.workPackages}',
            Target : 'workPackages/@UI.LineItem'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : '{i18n>Projects.workItems}',
            Target : 'workItems/@UI.LineItem'
        },
    ],
    FieldGroup          : {
        $Type : 'UI.FieldGroupType',
        Label : '{i18n>Classification}',
        Data  : [
            {Value : friendlyID},
            {Value : IOTProjectID},
            {Value : invoiceRelevance},
            {Value : bonusRelevance},
        ],
    },
    Identification      : [
        // title and description are only necessary for ODataV2 Elements
        // => in V4 they are editable within the ObjectHeader
        {Value : title},
        {Value : description},
        {Value : customer_ID},
        {Value : manager_userPrincipalName},
    ],
    SelectionFields     : [
        title,
        description,
        customer_ID,
        manager_userPrincipalName,
        invoiceRelevance,
        bonusRelevance,
    ],
    LineItem            : [
        {
            $Type : 'UI.DataField',
            Value : title,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Projects.customer}',
            Value : customer_ID,
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
            Label : '{i18n>Projects.manager}',
            Value : manager_userPrincipalName,
        },
        {
            $Type : 'UI.DataField',
            Value : IOTProjectID,
        },
        {
            $Type : 'UI.DataField',
            Value : invoiceRelevance,
        },
        {
            $Type : 'UI.DataField',
            Value : bonusRelevance,
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
annotate my.Packages with @(UI : {
    PresentationVariant : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{Property : title}],
        Visualizations : ['@UI.LineItem'],
        RequestAtLeast : [title]
    },
    HeaderInfo          : {
        TypeName       : '{i18n>Package}',
        TypeNamePlural : '{i18n>Packages}',
        Title          : {Value : title},
        Description    : {Value : description},
    },
    Facets              : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.Identification'
    }, ],
    Identification      : [
        {Value : title},
        {Value : description},
        {Value : IOTPackageID},
    ],
    SelectionFields     : [
        title,
        description,
    ],
    LineItem            : [
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
            Value : IOTPackageID,
        },
        {
            $Type : 'UI.DataField',
            Value : invoiceRelevance,
        },
        {
            $Type : 'UI.DataField',
            Value : bonusRelevance,
        },
    ]
}) {
    ID @UI.Hidden;
};

annotate my.WorkItems with @(UI : {
    // The Sort order is not evaluated by responsive tables (by design)
    // See: https://sapui5.hana.ondemand.com/#/api/sap.ui.comp.smarttable.SmartTable%23annotations/PresentationVariant
    PresentationVariant : {
        $Type          : 'UI.PresentationVariantType',
        // SortOrder      : [{
        //     Descending : true,
        //     Property   : completedDate,
        // }],
        Visualizations : ['@UI.LineItem'],
    // RequestAtLeast : [completedDate]
    },
    Identification      : [
        {Value : title},
        {Value : assignedTo.displayName, },
        {Value : customer_ID, },
        {Value : project_ID, },
        {Value : activatedDate},
        {Value : completedDate, },
    ],
    SelectionFields     : [
        title,
        assignedTo_userPrincipalName,
        customer_ID,
        project_ID,
        activatedDate,
        completedDate,
    ],
    LineItem            : [
        {
            $Type : 'UI.DataField',
            Value : title,
        },
        {
            $Type : 'UI.DataField',
            Value : assignedTo_userPrincipalName,
        },
        {
            $Type : 'UI.DataField',
            Value : customer_ID,
        },
        {
            $Type : 'UI.DataField',
            Value : project_ID,
        },
        {
            $Type : 'UI.DataField',
            Value : duration
        },
        {
            $Type : 'UI.DataField',
            Value : activatedDate
        },
        {
            $Type : 'UI.DataField',
            Value : completedDate,
        },
        {
            $Type : 'UI.DataField',
            Value : invoiceRelevance,
        },
        {
            $Type : 'UI.DataField',
            Value : bonusRelevance,
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
    project  @(Common : {
        Text         : {
            $value                 : project.title,
            ![@UI.TextArrangement] : #TextOnly
        },
        FieldControl : #Mandatory
    });
};

@cds.odata.valuelist
annotate my.Users2Projects;
//  with @(UI : {
//     PresentationVariant : {
//         $Type          : 'UI.PresentationVariantType',
//         SortOrder      : [{Property : user.displayName}],
//         Visualizations : ['@UI.LineItem'],
//         RequestAtLeast : [user.displayName]
//     },
//     HeaderInfo          : {
//         TypeName       : '{i18n>User2Project}',
//         TypeNamePlural : '{i18n>Users2Projects}',
//         Title          : {Value : user.displayName},
//         Description    : {Value : project.title},
//     },
//     Facets              : [{
//         $Type  : 'UI.ReferenceFacet',
//         Label  : '{i18n>General}',
//         Target : '@UI.Identification'
//     }, ],
//     Identification      : [
//         {Value : user_userPrincipalName},
//         {Value : project_ID},
//     ],
//     SelectionFields     : [
//         user_userPrincipalName,
//         project_ID,
//     ],
//     LineItem            : [
//         {
//             $Type : 'UI.DataField',
//             Value : user_userPrincipalName,
//         },
//         {
//             $Type : 'UI.DataField',
//             Value : project_ID,
//         },
//     ]
// }) {
//     ID      @UI.Hidden;
//     project @(Common : {
//         Text         : {
//             $value                 : project.title,
//             ![@UI.TextArrangement] : #TextOnly
//         },
//         FieldControl : #Mandatory
//     });
//     user    @(Common : {
//         Text         : {
//             $value                 : user.displayName,
//             ![@UI.TextArrangement] : #TextOnly
//         },
//         FieldControl : #Mandatory
//     });
// };
