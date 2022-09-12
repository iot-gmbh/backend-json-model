using {iot.planner as my} from '../db/schema';

service VisualizeService {
  entity Categories       as projection on my.Categories

  @Capabilities : {ReadRestrictions : {
    $Type    : 'Capabilities.ReadRestrictionsType',
    Readable : false,
  }, }
  entity CategoryLevels   as projection on my.CategoryLevels;

  entity Users            as projection on my.Users;
  entity Users2Categories as projection on my.Users2Categories;
  entity WorkItems        as projection on my.WorkItems;
//   entity Users as projection on my.Users;
//   entity Users as projection on my.Users;
//   entity Users as projection on my.Users;
//   entity Users as projection on my.Users;

}
