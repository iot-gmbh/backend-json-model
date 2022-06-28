using {iot.planner as my} from '../db/schema';

service AdminService @(requires : 'authenticated-user') {
  // @odata.draft.enabled
  @odata.create.enabled
  @odata.update.enabled
  entity Users @(restrict : [
    // {
    //   grant : 'READ',
    //   to    : 'team-lead',
    //   // Association paths are currently supported on SAP HANA only
    //   // https://cap.cloud.sap/docs/guides/authorization#association-paths
    //   where : 'managerPrincipalName = $user'
    // },
    // {
    //   grant : 'READ',
    //   to    : 'authenticated-user',
    //   where : 'userPrincipalName = $user'
    // },
    {
      grant : [
        'READ',
        'WRITE'
      ],
      to    : 'authenticated-user'
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

  // entity UsersToCategories          as
  //   select
  //     key Categories.ID,
  //         *
  //   from my.Categories
  //   left outer join AggregatedUsersPerCategoryView
  //     on Categories.ID = AggregatedUsersPerCategoryView.ID;

  // entity Users2Categories           as projection on my.Users2Categories;
  // entity AggregatedUsersPerCategory as projection on AggregatedUsersPerCategoryView;

  // view AggregatedUsersPerCategoryView as
  //   select
  //     key category.ID,
  //         string_agg(
  //           user.userPrincipalName, ', ') as users : String
  //     from my.Users2Categories
  //     group by
  //       category.ID;

  @odata.create.enabled
  @odata.update.enabled
  entity ProjectsPerUser  as projection on my.Users2Projects;

  @cds.redirection.target : true
  entity UsersPerProject  as projection on my.Users2Projects;

  @odata.draft.enabled
  entity Customers        as projection on my.Customers;

  entity Travels          as projection on my.Travels;

  @odata.create.enabled
  @odata.update.enabled
  // @odata.draft.enabled
  entity Projects         as projection on my.Projects where friendlyID != 'DELETED';

  @odata.create.enabled
  @odata.update.enabled
  entity Packages         as projection on my.Packages as Packages

  @odata.create.enabled
  @odata.update.enabled
  entity Categories       as projection on my.Categories as Categories

  @odata.create.enabled
  @odata.update.enabled
  entity Users2Categories as projection on my.Users2Categories

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
      where : 'assignedTo_userPrincipalName = $user'
    },
    {
      grant : 'READ',
      to    : 'admin',
    },
  ])                      as projection on my.WorkItems as WorkItems
};
