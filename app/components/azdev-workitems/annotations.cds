using AzureDevopsService as service from '../../srv/azure-devops';

annotate my.WorkItems with @(UI : {
    Identification  : [
        {Value : title},
        {Value : assignedTo_userPrincipalName, },
        {Value : assignedToName, },
        {Value : customer_friendlyID, },
        {Value : project_friendlyID, },
        {Value : activatedDate},
        {Value : completedDate, },
    ],
    SelectionFields : [
        title,
        assignedTo_userPrincipalName,
        assignedToName,
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
            Value : assignedTo_userPrincipalName,
        },
        {
            $Type : 'UI.DataField',
            Value : assignedToName,
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
