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
  ])                      as projection on my.Users;

  entity Travels          as projection on my.Travels;
  entity Tags             as projection on my.Tags;
  entity Tags2Categories  as projection on my.Tags2Categories;
  entity Tags2WorkItems   as projection on my.Tags2WorkItems;
  entity Categories       as projection on my.Categories;
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
