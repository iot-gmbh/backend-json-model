using {iot.planner as my} from '../db/schema';


service CategoriesService @(requires : 'authenticated-user') {
  entity Categories as projection on my.Categories;
  function getCumulativeCategoryDurations(dateFrom : DateTime, dateUntil : DateTime, excludeEmptyDurations : Boolean) returns array of Categories;
  function getCategoriesByID(root : UUID)                                                                             returns array of Categories;
  function getMyCategories(root : UUID)                                                                               returns array of Categories;
}
