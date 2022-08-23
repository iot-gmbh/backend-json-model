using {iot.planner as my} from '../db/schema';


service CategoriesService @(requires : 'authenticated-user') {
  entity Categories       as projection on my.Categories;
  function getCumulativeCategoryDurations(dateFrom : DateTime, dateUntil : DateTime, excludeEmptyDurations : Boolean) returns array of Categories;

  @(restrict : [{to : 'Admin'}])
  function getCategoryTree(root : UUID, validAt : DateTime)                                                           returns array of Categories;

  function getMyCategoryTree(root : UUID, validAt : DateTime)                                                         returns array of Categories;

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

  entity Users2Categories as projection on my.Users2Categories {
    *,
    user.displayName
  };
}
