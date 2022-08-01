using {iot.planner as my} from '../db/multitenancy';
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
  ])                        as projection on my.WorkItems;

  @cds.redirection.target
  entity Categories         as projection on my.Categories;

  entity Users2Categories   as projection on my.Users2Categories;
  entity MyCategories       as projection on my.Categories;
  entity Tags               as projection on my.Tags;
  entity Tags2WorkItems     as projection on my.Tags2WorkItems;

  @cds.redirection.target
  entity Tags2Categories    as projection on my.Tags2Categories;

  entity MatchCategory2Tags as projection on my.MatchCategory2Tags;

  // entity WorkItemsToCategories  as
  //   select from my.WorkItems as workItems
  //   join my.Tags2WorkItems as t2w
  //     on t2w.workItem.ID = workItems.ID
  //   join my.Tags2Categories as t2c
  //     on t2w.tag.title = t2c.tag.title
  //   {
  //     key workItems.ID    as workItemID,
  //         t2c.category.ID as categoryID
  //   };

  entity CategoryLevels     as projection on my.CategoryLevels;
  entity MyUser             as projection on my.Users;
}
