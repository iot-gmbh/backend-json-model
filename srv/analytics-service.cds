using {iot.planner as my} from '../db/schema';

service AnalyticsService {
    entity WorkItems as projection on my.WorkItems {
        key assignedTo, key customer, key project, duration
    };

    entity Customers as projection on my.Customers;
    entity Projects  as projection on my.Projects;
    entity Users     as projection on my.Users;
}
