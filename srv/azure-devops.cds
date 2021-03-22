using {iot.planner as my} from '../db/schema';

// service AzureDevopsService @(requires : 'authenticated-user') {
service AzureDevopsService @(requires : 'authenticated-user') {
    entity WorkItems   as projection on my.WorkItems;
    entity MyWorkItems as projection on my.WorkItems;

    entity Employees   as projection on my.Employees {
        * , workItems : redirected to MyWorkItems
    };

    entity Projects    as projection on my.Projects;
    entity Tasks       as projection on my.Tasks;
};
