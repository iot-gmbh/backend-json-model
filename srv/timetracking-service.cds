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
  ])                     as projection on my.WorkItems;

  entity MyCategories    as projection on my.Categories;
  entity HierarchyLevels as projection on my.CategoryLevels;
  entity Hierarchies     as projection on my.Hierarchies;
  entity MyUser          as projection on my.Users;
}
