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

  @cds.redirection.target : true
  entity UsersPerProject as projection on my.Users2Projects;

  @odata.draft.enabled
  entity Customers       as projection on my.Customers {
    *,
    invoiceRelevance as invoiceRelevance : Decimal @(title : '{i18n>Customers.invoiceRelevance}'),
  };

  @odata.create.enabled
  @odata.update.enabled
  // @cds.redirection.target : true
  entity Projects        as projection on my.Projects {
    *,
    customer                                              : redirected to Customers,
    customer.invoiceRelevance as customerInvoiceRelevance : Decimal,

    case
      when
        invoiceRelevance is not null
      then
        invoiceRelevance
      else
        customer.invoiceRelevance
    // end                               as invoiceRelevance         : Decimal @(title : '{i18n>Projects.invoiceRelevance}'),
    end                       as invoiceRelevance         : Decimal @(
      title         : '{i18n>Projects.invoiceRelevance}',
      // odata.update.enabled : true,
      Core.Computed : false
    )

  } where friendlyID != 'DELETED';

  @odata.create.enabled
  @odata.update.enabled
  // @cds.redirection.target : true
  entity Packages        as projection on my.Packages as Packages {
    *,
    project                                                       : redirected to Projects,
    project.invoiceRelevance          as projectInvoiceRelevance  : Decimal,
    project.customer.invoiceRelevance as customerInvoiceRelevance : Decimal,

    case
      when
        invoiceRelevance is not null
      then
        invoiceRelevance
      when
        project.invoiceRelevance is not null
      then
        project.invoiceRelevance
      else
        project.customer.invoiceRelevance
    end                               as invoiceRelevance         : Decimal @(
      title         : '{i18n>Packages.invoiceRelevance}',
      Core.Computed : false
    )
  };

  @cds.search
  // @cds.redirection.target : true
  entity WorkItems                                                                         @(restrict : [
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
  ])                     as projection on my.WorkItems as WorkItems {
    *,
    workPackage                                                                  : redirected to Packages,
    workPackage.invoiceRelevance                  as workPackageInvoiceRelevance : Decimal,
    workPackage.project.invoiceRelevance          as projectInvoiceRelevance     : Decimal,
    workPackage.project.customer.invoiceRelevance as customerInvoiceRelevance    : Decimal,

    case
      when
        invoiceRelevance is not null
      then
        invoiceRelevance
      when
        workPackage.invoiceRelevance is not null
      then
        workPackage.invoiceRelevance
      when
        workPackage.project.invoiceRelevance is not null
      then
        workPackage.project.invoiceRelevance
      else
        workPackage.project.customer.invoiceRelevance
    end                                           as invoiceRelevance            : Decimal @(
      title         : '{i18n>WorkItems.invoiceRelevance}',
      Core.Computed : false
    )
  };
};
