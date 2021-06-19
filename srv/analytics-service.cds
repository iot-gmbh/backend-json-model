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
        key ID,
        @Analytics.Dimension : true
        assignedTo.displayName as assignedToName @(title: '{i18n>WorkItemsAggr.assignedTo}'),
        @Analytics.Dimension : true
        customer.name as customerName @(title: '{i18n>WorkItemsAggr.customer}'),
        @Analytics.Dimension : true
        project.title as projectTitle  @(title: '{i18n>WorkItemsAggr.project}'),
        @Analytics.Dimension : true
        key workPackage.title as packageTitle  @(title: '{i18n>WorkItemsAggr.package}'),

        @Analytics.Dimension : true
        activatedDate,
        @Analytics.Dimension : true
        completedDate,
        @Analytics.Dimension : true
        activatedDateMonth,
        @Analytics.Dimension : true
        activatedDateYear,
        
        @Analytics.Measure   : true
        @Aggregation.default : #SUM
        round(duration, 2) as duration: Decimal(9, 2) @(title: '{i18n>WorkItemsAggr.duration}'),
        @Analytics.Dimension : true
        customer,
        @Analytics.Dimension : true
        project,
        @Analytics.Dimension : true
        workPackage,
        @Analytics.Dimension : true
        assignedTo,
    };

    entity Customers as projection on my.Customers;
    entity Projects  as projection on my.Projects;
    entity Users     as projection on my.Users;
}
