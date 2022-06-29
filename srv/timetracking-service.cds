using {iot.planner as my} from '../db/schema';
// using {AzureDevopsService as AzDevOps} from './azure-devops';
// using {MSGraphService as MSGraph} from './msgraph-service';

service TimetrackingService @(requires : 'authenticated-user') {

  @cds.redirection.target : true
  entity MyWorkItems @(restrict : [
    {
      grant : 'READ',
      where : 'assignedTo_userPrincipalName = $user'
    },
    {
      grant : 'WRITE',
      to    : 'authenticated-user'
    }
  ])                    as projection on my.WorkItems;

  entity MyCategories   as projection on my.Categories;
  entity CategoryLevels as projection on my.CategoryLevels;

  entity WorkItems      as
    select from my.WorkItems as item
    left outer join my.Categories as cat1
      on item.parent.ID = cat1.ID
    left outer join my.Categories as cat2
      on cat1.parent.ID = cat2.ID
    left outer join my.Categories as cat3
      on cat2.parent.ID = cat3.ID
    {
      key item.ID,
          item.title,
          cat1.title           as cat1,
          cat1.hierarchyLevel  as cat1Level,
          cat1.levelName.title as cat1LevelName,
          cat2.title           as cat2,
          cat2.hierarchyLevel  as cat2Level,
          cat2.levelName.title as cat2LevelName,
          cat3.title           as cat3,
          cat3.hierarchyLevel  as cat3Level,
          cat3.levelName.title as cat3LevelName
    };

  entity Customers      as projection on my.Customers;
  entity Projects       as projection on my.Projects;
  entity Packages       as projection on my.Packages;
  entity Users2Projects as projection on my.Users2Projects;
  entity MyUser         as projection on my.Users;
}
