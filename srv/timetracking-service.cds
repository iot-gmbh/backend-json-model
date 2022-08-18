using {iot.planner as my} from '../db/schema';
using {MSGraphService} from './msgraph-service';
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
  ])                      as projection on my.WorkItems;

  entity MSGraphWorkItems as projection on MSGraphService.Events {
    key ID,
        title,
        start      as activatedDate,
        end        as completedDate,
        isPrivate,
        categories as tags,
        isAllDay,
  };

  action removeDraft(ID : String, activatedDate : DateTime, completedDate : DateTime);
  action resetToDraft(ID : String) returns MyWorkItems;

  @cds.redirection.target
  entity MyCategories     as projection on my.Categories;

  // entity Events           as projection on events;
  entity Categories       as projection on my.Categories;
  entity Users2Categories as projection on my.Users2Categories;
  entity Tags             as projection on my.Tags;
  entity Tags2WorkItems   as projection on my.Tags2WorkItems;
  entity Tags2Categories  as projection on my.Tags2Categories;
  entity CategoryLevels   as projection on my.CategoryLevels;
  entity MyUser           as projection on my.Users;
}
