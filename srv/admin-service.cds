using {iot.planner as my} from '../db/schema';

service AdminService
// @(requires : 'authenticated-user')
{
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
      grant : [
        'READ',
        'WRITE'
      ],
      to    : 'admin',
    },
  ])                     as projection on my.Users {
    *,
    projects : redirected to ProjectsPerUser
  };

  @odata.create.enabled
  @odata.update.enabled
  entity ProjectsPerUser as projection on my.Users2Projects;

//   entity PackagesDB      as projection on my.PackagesDB;

  @odata.create.enabled
  @odata.update.enabled
  // entity Packages        as projection on my.PackagesDB {
  //     *,
  //     55 as parentInvoiceRelevance: Decimal @(title : '{i18n>Packages.parentInvoiceRelevance}'),

  // entity PackagesTest as
  //     select from my.Packages as Packages
  //         inner join ProjectsTest as Projects
  //             on Packages.project.ID = Projects.ID {
  //     Packages.title as title: String @(title : '{i18n>Packages.title}'),
  //     Projects.testRelevance as parentInvoiceRelevance: Decimal @(title : '{i18n>Packages.parentInvoiceRelevance}'),
  // };

  entity UsersPerProject as projection on my.Users2Projects;

  @odata.draft.enabled
  entity Customers       as projection on my.Customers;

  // @odata.draft.enabled
  // @odata.create.enabled
  // @odata.update.enabled
  // entity Projects        as projection on my.Projects {
  //     *,
  //     customer.invoiceRelevance as parentInvoiceRelevance    : Decimal @(title : '{i18n>Projects.parentInvoiceRelevance}'),
  //     teamMembers : redirected to UsersPerProject,

  @odata.create.enabled
  @odata.update.enabled

  entity Projects        as projection on my.Projects {

    *,

    ifnull(

      invoiceRelevance, customer.invoiceRelevance

    )                         as invoiceRelevance       : Decimal @(title : '{i18n>WorkItems.parentInvoiceRelevance}'),

    customer.invoiceRelevance as parentInvoiceRelevance : Decimal @(title : '{i18n>Projects.parentInvoiceRelevance}'),
    teamMembers                                         : redirected to UsersPerProject,


  } where friendlyID != 'DELETED';


  // @odata.create.enabled

  // // @odata.update.enabled


  entity PackagesDB        as

    select from my.PackagesDB as PackagesDB

    // inner join Projects as Projects

    //   on PackagesDB.project.ID = Projects.ID

    {
        *,
    //   PackagesDB.createdAt              as createdAt        : Timestamp,
    //   PackagesDB.createdBy              as createdBy        : String,
    //   PackagesDB.ID                     as ID               : UUID,
    //   PackagesDB.modifiedAt             as modifiedAt       : Timestamp,
    //   PackagesDB.modifiedBy             as modifiedBy       : String,
    //   PackagesDB.project                as project       : UUID,
    //   PackagesDB.parentInvoiceRelevance as parentInvoiceRelevance : Decimal,
    //   PackagesDB.IOTPackageID           as IOTPackageID     : String,
    //   PackagesDB.description            as description      : String,
    //   PackagesDB.title                  as title            : String @(title : '{i18n>Packages.title}'),

    //   ifnull(

    //     PackagesDB.invoiceRelevance, Projects.invoiceRelevance

    //   )                                 as invoiceRelevance : Decimal

    //                                                                  @(title : '{i18n>Packages.parentInvoiceRelevance}'),


      };

  // entity ProjectsTest    as projection on my.Projects {
  //     *,
  //     customer.invoiceRelevance as parentInvoiceRelevance    : Decimal @(title : '{i18n>Projects.parentInvoiceRelevance}'),
  //     teamMembers : redirected to UsersPerProject,
  //     4 as testRelevance : Decimal,
  // }
  // where friendlyID != 'DELETED';

  @cds.search
  entity WorkItems                                                         @(restrict : [
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
  ])                     as projection on my.WorkItems {
    // expand for authorization checks (see above)
    *,
    workPackage.parentInvoiceRelevance as parentInvoiceRelevance : Decimal @(title : '{i18n>WorkItems.parentInvoiceRelevance}'),
    assignedTo.userPrincipalName
  } where deleted is null;
};
