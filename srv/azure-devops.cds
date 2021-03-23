using {iot.planner as my} from '../db/schema';

service AzureDevopsService {
    // service AzureDevopsService @(requires : 'authenticated-user') {
    entity WorkItems   as projection on my.WorkItems;
    entity MyWorkItems as projection on my.WorkItems;
    entity MyWork      as projection on my.WorkItems;

    entity Projects    as projection on my.Projects {
        * , workItems : redirected to MyWorkItems
    };

    entity Tasks       as projection on my.Tasks;
};
