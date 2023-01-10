using {iot.planner as my} from '../db/schema';


service CategoriesService @(requires: 'authenticated-user') {
  entity Categories       as projection on my.Categories excluding {
    manager,
    members,
    tags,
    // parent,
    // children,
    level,
  };

  function getCumulativeCategoryDurations(dateFrom : DateTime, dateUntil : DateTime, excludeEmptyDurations : Boolean) returns array of Categories;

  @(restrict: [{to: 'admin'}])
  function getCategoryTree(root : UUID, validAt : DateTime)                                                           returns array of Categories;

  function getMyCategoryTree(root : UUID, validAt : DateTime)                                                         returns array of Categories;
  function getMyCustomers(root : UUID, validAt : DateTime)                                                            returns array of Categories;
  function getMyProjects(root : UUID, validAt : DateTime)                                                             returns array of Categories;
  function getMySubprojects(root : UUID, validAt : DateTime)                                                          returns array of Categories;
  function getMyWorkPackages(root : UUID, validAt : DateTime)                                                         returns array of Categories;

  // @odata.draft.enabled : true
  @odata.create.enabled
  @odata.update.enabled
  entity Users                       @(restrict: [{
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'admin',
  }, ])                   as projection on my.Users {
    *,
    sum(
      vacations.durationInDays
    ) as vacDaysTotal     : Integer  @odata.Type: 'Edm.String'  @Common.Label: '{i18n>Users.vacDaysTotal}',
    yearlyVacDays - sum(
      vacations.durationInDays
    ) as vacDaysRemaining : Integer  @odata.Type: 'Edm.String'  @Common.Label: '{i18n>Users.vacDaysRemaining}'
  } group by userPrincipalName;

  entity Users2Categories as projection on my.Users2Categories {
    *,
    user.displayName
  };

  entity Vacations        as projection on my.Vacations;
}
