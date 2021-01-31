using {AzureDevopsService as my} from '../../srv/azure-devops';

annotate my.Items with @(UI : {
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
    AssignedTo
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
        Value : CreatedDate
    },
    {
        $Type : 'UI.DataField',
        Value : ChangedDate,
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
    }
    ]
});
