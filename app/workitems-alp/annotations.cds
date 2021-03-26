using AzureDevopsService as service from '../../srv/azure-devops';

annotate my.WorkItemStatistics with @(UI : {LineItem : [
    {
        $Type : 'UI.DataField',
        Value : originalEstimate,
    },
    {
        $Type : 'UI.DataField',
        Value : completedDate,
    }
]});
