using {iot.planner as my} from '../db/schema';


service AnalyticsService {
    // @Aggregation.ApplySupported.PropertyRestrictions : true
    entity WorkItems as projection on my.WorkItems {
        @Analytics.Dimension: true
        key assignedTo, 
        
        @Analytics.Dimension: true
        key customer,
        
        @Analytics.Dimension: true
        key project,

        @Analytics.AccumulativeMeasure : true
        @Aggregation.default           : #SUM
        duration, 
        activatedDate, 
        completedDate
    };

    entity Customers as projection on my.Customers;
    entity Projects  as projection on my.Projects;
    entity Users     as projection on my.Users;
}
