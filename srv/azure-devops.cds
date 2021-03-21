using {iot.planner as my} from '../db/schema';

service AzureDevopsService @(_requires : 'authenticated-user') {
    entity WorkItems as projection on my.WorkItems;
    entity Employees as projection on my.Employees;
    entity Projects  as projection on my.Projects;
    entity Tasks     as projection on my.Tasks;
};
