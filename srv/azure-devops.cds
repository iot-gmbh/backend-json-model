using {iot.planner as my} from '../db/schema';

service AzureDevopsService @(requires : 'authenticated-user') {
    entity WorkItems   as projection on my.WorkItems;
    entity MyWorkItems as projection on my.WorkItems;
    entity MyWork      as projection on my.WorkItems;

    entity Projects    as projection on my.Projects {
        * , workItems : redirected to MyWorkItems
    };

    entity Users       as projection on my.Users {
        * , workItems : redirected to MyWorkItems
    };

    entity Customers   as projection on my.Customers;
};
