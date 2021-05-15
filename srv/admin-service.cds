using {iot.planner as my} from '../db/schema';

service AdminService @(requires : 'authenticated-user') {
    @odata.draft.enabled
    entity Users     as projection on my.Users;

    @odata.draft.enabled
    entity Customers as projection on my.Customers;

    // @odata.draft.enabled
    entity Projects  as projection on my.Projects;
    entity WorkItems as projection on my.WorkItems;
};
