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

  entity UsersPerProject as projection on my.Users2Projects;

  @odata.draft.enabled
  entity Customers       as projection on my.Customers;

  @odata.create.enabled
  @odata.update.enabled
  @cds.redirection.target : true
  entity Projects        as projection on my.Projects {
    *,
    ifnull(
      invoiceRelevance, customer.invoiceRelevance
    ) as invoiceRelevance : Decimal @(title : '{i18n>Projects.invoiceRelevance}'),
    workPackages          : redirected to PackagesView,
    workItems             : redirected to WorkItems,
    teamMembers           : redirected to UsersPerProject,
  } where friendlyID != 'DELETED';

  entity PackagesView    as projection on my.Packages as Packages {
    *,
    ifnull(
      Packages.invoiceRelevance, project.invoiceRelevance
    ) as invoiceRelevance : Decimal @(title : '{i18n>Packages.invoiceRelevance}'),
  };

  // @odata.create.enabled
  // @odata.update.enabled
  // @cds.redirection.target : true
  // entity Packages               as projection on my.Packages {
  //   *,
  //   project                                         : redirected to Projects,
  //   ifnull(Packages.invoiceRelevance, project.invoiceRelevance)
  //                               as invoiceRelevance : Decimal @(title : '{i18n>Packages.invoiceRelevance}'),
  // };

  @odata.create.enabled
  @odata.update.enabled
  @cds.redirection.target : true
  entity Packages        as
    select from my.Packages as Packages
    inner join Projects as Projects
      on Packages.project.ID = Projects.ID
    {
          *,
      key Packages.ID          as ID               : UUID,
          Packages.createdAt   as createdAt        : Timestamp,
          Packages.createdBy   as createdBy        : String,
          Packages.modifiedAt  as modifiedAt       : Timestamp,
          Packages.modifiedBy  as modifiedBy       : String,
          Packages.title       as title            : String  @(title : '{i18n>Packages.title}'),
          Packages.description as description      : String,
          Packages.workItems   as workItems        : redirected to WorkItems,
          Packages.project     as project          : redirected to Projects, // mit * abgedeckt
          ifnull(
            Packages.invoiceRelevance, Projects.invoiceRelevance
          )                    as invoiceRelevance : Decimal @(title : '{i18n>Packages.invoiceRelevance}'),
    };

  // @cds.search
  // @cds.redirection.target : true
  // entity WorkItems @(restrict : [
  //   {
  //     grant : 'READ',
  //     to    : 'team-lead',
  //     where : 'manager_userPrincipalName = $user'
  //   },
  //   {
  //     grant : 'READ',
  //     to    : 'authenticated-user',
  //     where : 'userPrincipalName = $user'
  //   },
  //   {
  //     grant : 'READ',
  //     to    : 'admin',
  //   },
  // ])                     as projection on my.WorkItems {
  //   // expand for authorization checks (see above)
  //   *,
  //   workPackage                                                                : redirected to Packages,
  //   ifnull(invoiceRelevance, workPackage.invoiceRelevance) as invoiceRelevance : Decimal @(title : '{i18n>WorkItems.invoiceRelevance}'),
  //   assignedTo.userPrincipalName

  // } where deleted is null;


  entity WorkItemsView   as projection on my.WorkItems as WorkItems {
    *,
    workPackage                                                         : redirected to PackagesView,
    workPackage.invoiceRelevance         as workPackageInvoiceRelevance : Decimal,
    workPackage.project.invoiceRelevance as projectInvoiceRelevance     : Decimal,

    case
      when
        invoiceRelevance is not null
      then
        invoiceRelevance
      when
        workPackage.invoiceRelevance is not null
      then
        workPackage.invoiceRelevance
      else
        workPackage.project.invoiceRelevance
    end                                  as invoiceRelevance            : Decimal,

  // ifnull(
  //   WorkItems.invoiceRelevance, workPackage.invoiceRelevance
  // )                                    as invoiceRelevance            : Decimal @(title : '{i18n>Packages.invoiceRelevance}'),
  };

  @cds.search
  @cds.redirection.target : true
  entity WorkItems                                                   @(restrict : [
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
  ])                     as
    select from my.WorkItems as WorkItems
    inner join my.Packages as Packages
      on WorkItems.workPackage.ID = Packages.ID
    {
      *,
      WorkItems.ID                  as ID                  : String,
      WorkItems.title               as title               : String,
      WorkItems.customer_friendlyID as customer_friendlyID : String,
      WorkItems.customer            as customer            : redirected to Customers,
      WorkItems.project             as project             : redirected to Projects,
      WorkItems.workPackage         as workPackage         : redirected to PackagesView, // mit * abgedeckt
      ifnull(
        WorkItems.invoiceRelevance, Packages.invoiceRelevance
      )                             as invoiceRelevance    : Decimal @(title : '{i18n>WorkItems.invoiceRelevance}'),
    }
    where
      deleted is null;
};
