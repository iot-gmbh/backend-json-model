using {iot.planner as my} from '../db/schema';

@Aggregation.ApplySupported.PropertyRestrictions : true
service Statistics {
    @readonly
    entity WorkItems as
        select from my.WorkItems {
                @Analytics.Dimension : true
            key customer,
                @Analytics.Dimension : true
            key assignedTo,
                @Analytics.Dimension : true
            key project,
                @Aggregation.default : #SUM
                sum(
                    duration
                ) as totalEstimate : Integer,
        }
        group by
            customer,
            assignedTo,
            project;

    entity Customers as projection on my.Customers;
    entity Projects  as projection on my.Projects;
    entity Users     as projection on my.Users;
}
