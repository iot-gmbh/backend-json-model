using {iot.planner as my} from '../db/schema';
using {iot.planner.hierarchies as hier} from '../db/hierarchies';
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
  entity Tags           as projection on my.Tags;
  entity CategoryLevels as projection on my.CategoryLevels;
  entity Hierarchies    as projection on hier.Hierarchies;
  entity MyUser         as projection on my.Users;
}
