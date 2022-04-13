using {iot.planner as my} from '../db/schema';

service AdminService 
// @(requires : 'authenticated-user')
{
    @odata.draft.enabled
    entity Users 
    // @(restrict : [
    //     {
    //         grant : 'READ',
    //         to    : 'team-lead',
    //         // Association paths are currently supported on SAP HANA only
    //         // https://cap.cloud.sap/docs/guides/authorization#association-paths
    //         where : 'userPrincipalName = $user'
    //     },
    //     {
    //         grant : 'READ',
    //         to    : 'authenticated-user',
    //         where : 'userPrincipalName = $user'
    //     },
    //     {
    //         grant : [
    //             'READ',
    //             'WRITE'
    //         ],
    //         to    : 'admin',
    //     },
    // ])                     
    as projection on my.Users {
        * , projects : redirected to ProjectsPerUser
    };

    @odata.create.enabled
    @odata.update.enabled
    entity ProjectsPerUser as projection on my.Users2Projects;

    // @odata.create.enabled
    // @odata.update.enabled
    // entity Packages        as projection on my.Packages {
    entity PackagesTest as
        select from my.Packages as Packages
            inner join ProjectsTest as Projects
                on Packages.project.ID = Projects.ID {
        Packages.title as title: String @(title : '{i18n>Packages.title}'),
        Projects.testRelevance as parentInvoiceRelevance: Decimal @(title : '{i18n>Packages.parentInvoiceRelevance}'),
    };

    entity UsersPerProject as projection on my.Users2Projects;

    @odata.draft.enabled
    entity Customers       as projection on my.Customers;

    // @odata.draft.enabled
    @odata.create.enabled
    @odata.update.enabled
    entity ProjectsTest    as projection on my.Projects {
        *,
        customer.invoiceRelevance as parentInvoiceRelevance    : Decimal @(title : '{i18n>Projects.parentInvoiceRelevance}'),
        teamMembers : redirected to UsersPerProject,
        4 as testRelevance : Decimal,
    } where friendlyID != 'DELETED';

    @cds.search
    entity WorkItems
    // @(restrict : [
    //     {
    //         grant : 'READ',
    //         to    : 'team-lead',
    //         where : 'manager_userPrincipalName = $user'
    //     },
    //     {
    //         grant : 'READ',
    //         to    : 'authenticated-user',
    //         where : 'userPrincipalName = $user'
    //     },
    //     {
    //         grant : 'READ',
    //         to    : 'admin',
    //     },
    // ])                     
    as projection on my.WorkItems {
        // expand for authorization checks (see above)
        *,
        ifnull(workPackage.invoiceRelevance, workPackage.parentInvoiceRelevance) as
        parentInvoiceRelevance: Decimal @(title : '{i18n>WorkItems.parentInvoiceRelevance}'),
        assignedTo.userPrincipalName
    } where deleted is null;
};
