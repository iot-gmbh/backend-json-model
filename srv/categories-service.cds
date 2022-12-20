using {iot.planner as my} from '../db/schema';


service CategoriesService @(requires : 'authenticated-user') {
  entity Categories       as projection on my.Categories excluding {
    manager,
    // members,
    tags,
    // parent,
    // children,
    level,
  };

  function getCumulativeCategoryDurations(dateFrom : DateTime, dateUntil : DateTime, excludeEmptyDurations : Boolean) returns array of Categories;

  // @(restrict : [{to : 'admin'}])
  function getCategoryTree(root : UUID, validAt : DateTime)                                                           returns array of Categories;

  function getMyCategoryTree(root : UUID, validAt : DateTime)                                                         returns array of Categories;
  function getMyCustomers(root : UUID, validAt : DateTime)                                                            returns array of Categories;
  function getMyProjects(root : UUID, validAt : DateTime)                                                             returns array of Categories;
  function getMySubprojects(root : UUID, validAt : DateTime)                                                          returns array of Categories;
  function getMyWorkPackages(root : UUID, validAt : DateTime)                                                         returns array of Categories;

  // @odata.draft.enabled : true
  @odata.create.enabled
  @odata.update.enabled
  entity Users @(restrict : [
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
