using AzureDevopsService as service from '../../srv/azure-devops';

annotate my.WorkItemStatistics with @(UI : {LineItem : [
    {
        $Type : 'UI.DataField',
        Value : duration,
    },
    {
        $Type : 'UI.DataField',
        Value : assignedTo,
    },
    {
        $Type : 'UI.DataField',
        Value : customer,
    },
    {
        $Type : 'UI.DataField',
        Value : project,
    }
]});
