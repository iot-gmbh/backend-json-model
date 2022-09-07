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
  ])                      as projection on my.WorkItems excluding {
    hierarchy
  };

  entity MSGraphWorkItems as projection on MSGraphService.WorkItems {
    key ID                       : String @odata.Type : 'Edm.String',
        title,
        activatedDate,
        completedDate,
        isPrivate,
        isAllDay,
        'MSGraphEvent' as source : String
  };

  action   removeDraft(ID : String, activatedDate : DateTime, completedDate : DateTime);
  action   resetToDraft(ID : String)                                         returns MyWorkItems;
  function getCalendarView(startDateTime : DateTime, endDateTime : DateTime) returns array of MyWorkItems;
  function getWorkItemByID(ID : String)                                      returns MyWorkItems;
  function categorizeWorkItem(workItem : MyWorkItems)                        returns MyWorkItems;
  function getMyCategoryTree()                                               returns array of MyCategories;

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
