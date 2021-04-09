using {iot.planner as my} from '../db/schema';

service AdminService @(requires : 'authenticated-user') {
    entity Users     as projection on my.Users;

    @odata.draft.enabled
    entity Customers as projection on my.Customers;

    entity Projects  as projection on my.Projects;
    entity WorkItems as projection on my.WorkItems;
};
