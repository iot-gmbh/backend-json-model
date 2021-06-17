using {iot.planner as my} from '../db/schema';

service AdminService @(requires : 'authenticated-user') {
    @odata.draft.enabled
    entity Users @(restrict : [
        {
            grant : 'READ',
            to    : 'team-lead',
            // Association paths are currently supported on SAP HANA only
            // https://cap.cloud.sap/docs/guides/authorization#association-paths
            where : 'userPrincipalName = $user'
        },
        {
            grant : 'READ',
            to    : 'authenticated-user',
            where : 'userPrincipalName = $user'
        },
        {
            grant : 'READ',
            to    : 'admin',
        },
    ])               as projection on my.Users;

    @odata.draft.enabled
    entity Customers as projection on my.Customers;

    @odata.draft.enabled
    entity Projects  as projection on my.Projects;

    entity WorkItems @(restrict : [
        {
            grant : 'READ',
            to    : 'team-lead',
            where : 'manager_userPrincipalName = $user'
        },
        {
            grant : 'READ',
            to    : 'authenticated-user',
            where : 'userPrincipalName = $user'
        },
        {
            grant : 'READ',
            to    : 'admin',
        },
    ])               as projection on my.WorkItems;
};
