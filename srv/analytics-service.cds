using {iot.planner as my} from '../db/schema';

service AnalyticsService {
    @Aggregation.ApplySupported.PropertyRestrictions : true
    entity WorkItems @(restrict : [
        {
            grant : 'READ',
            to    : 'team-lead',
            // Association paths are currently supported on SAP HANA only
            // https://cap.cloud.sap/docs/guides/authorization#association-paths
            where : 'assignedTo.manager_userPrincipalName = $user'
        },
        {
            grant : 'READ',
            to    : 'authenticated-user',
            where : 'assignedTo_userPrincipalName = $user'
        },
        {
            grant : 'READ',
            to    : 'admin',
        },
    ])        as projection on my.WorkItems {
        @Analytics.Dimension : true
        key assignedTo,
        @Analytics.Dimension : true
        key customer_friendlyID,
        @Analytics.Dimension : true
        key project_friendlyID,

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
