using {iot.planner as my} from '../db/schema';
using {AzureDevopsService as AzDevOps} from './azure-devops';
using {MSGraphService as MSGraph} from './msgraph-service';

service WorkItemsService @(requires : 'authenticated-user') {
    entity AzDevWorkItems as projection on AzDevOps.WorkItems;
    entity MSGraphEvents  as projection on MSGraph.Events;
    entity WorkItems      as projection on my.WorkItems;
    entity MyWorkItems    as projection on my.WorkItems;

    entity Projects       as projection on my.Projects {
        * , workItems : redirected to AzDevWorkItems
    };

    entity Users          as projection on my.Users {
        * , workItems : redirected to AzDevWorkItems
    };

    entity Customers      as projection on my.Customers;
};
