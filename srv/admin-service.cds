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
  ])                      as projection on my.Users {
    *,
    projects : redirected to ProjectsPerUser
  };

  @odata.create.enabled
  @odata.update.enabled
  entity ProjectsPerUser  as projection on my.Users2Projects;

  @cds.redirection.target : true
  entity UsersPerProject  as projection on my.Users2Projects;

  @odata.draft.enabled
  entity Customers        as projection on my.Customers;

  @odata.create.enabled
  @odata.update.enabled
  @odata.draft.enabled
  entity Projects         as projection on my.Projects where friendlyID != 'DELETED';

  @odata.create.enabled
  @odata.update.enabled
  entity Packages         as projection on my.Packages as Packages

  @cds.search
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
  ])                      as projection on my.WorkItems as WorkItems
};
