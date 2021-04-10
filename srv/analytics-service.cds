using {iot.planner as my} from '../db/schema';

service AnalyticsService {
    @Aggregation.ApplySupported.PropertyRestrictions : true
    entity WorkItems as projection on my.WorkItems {
        @Analytics.Dimension : true
        assignedTo,
        @Analytics.Dimension : true
        customer_friendlyID,
        @Analytics.Dimension : true
        project_friendlyID,

        @Analytics.Dimension : true
        activatedDate,
        @Analytics.Dimension : true
        completedDate,

        @Analytics.Measure   : true
        @Aggregation.default : #SUM
        duration, customer, project
    };

    entity Customers as projection on my.Customers;
    entity Projects  as projection on my.Projects;
    entity Users     as projection on my.Users;
}
