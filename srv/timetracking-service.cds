using {iot.planner as my} from '../db/schema';
using {MSGraphService} from './msgraph-service';
// using {AzureDevopsService as AzDevOps} from './azure-devops';
// using {MSGraphService as MSGraph} from './msgraph-service';

service TimetrackingService @(requires : 'authenticated-user') {

  entity MyWorkItems @(restrict : [
    {
      grant : '*',
      to    : 'admin'
    },
    {
      grant : '*',
      to    : 'team-lead',
      // Association paths are currently supported on SAP HANA only
      // https://cap.cloud.sap/docs/guides/authorization#association-paths
      where : 'managerUserPrincipalName = $user',
    },
    // {
    //   grant : '*',
    //   to    : 'project-lead',
    //   where : 'hierarchyLevel1ManagerUserPrincipalName = $user'
    // },
    {
      grant : '*',
      to    : 'authenticated-user',
      where : 'assignedToUserPrincipalName = $user'
    },
  ])                      as projection on my.WorkItems {
    *,
    assignedTo.userPrincipalName         as assignedToUserPrincipalName,
    assignedTo.manager.userPrincipalName as managerUserPrincipalName,
    // hierarchy.level1.manager.userPrincipalName as hierarchyLevel1ManagerUserPrincipalName,
    hierarchy.level0                     as level0,
    hierarchy.level1                     as level1,
    hierarchy.level2                     as level2,
    hierarchy.level3                     as level3,
    hierarchy.level0Title                as level0Title,
    hierarchy.level1Title                as level1Title,
    hierarchy.level2Title                as level2Title,
    hierarchy.level3Title                as level3Title,
    hierarchy.level0Alias                as customerAlias,
    hierarchy.level1Alias                as projectAlias,
    hierarchy.level2Alias                as subProjectAlias,
    hierarchy.level3Alias                as workPackageAlias,

  } where deleted is null

  entity MSGraphWorkItems as projection on MSGraphService.WorkItems {
    key ID                       : String @odata.Type : 'Edm.String',
        title,
        activatedDate,
        completedDate,
        isPrivate,
        isAllDay,
        location,
        'MSGraphEvent' as source : String
  };

  action   removeDraft(ID : String, activatedDate : DateTime, completedDate : DateTime);
  action   resetToDraft(ID : String)                                         returns MyWorkItems;
  function getCalendarView(startDateTime : DateTime, endDateTime : DateTime) returns array of MyWorkItems;
  function getWorkItemByID(ID : String)                                      returns MyWorkItems;
  function categorizeWorkItem(workItem : MyWorkItems)                        returns MyWorkItems;
  function getMyCategoryTree()                                               returns array of Categories;
  function getMyCustomers()                                                  returns array of Categories;
  function getMyProjects()                                                   returns array of Categories;
  function getMySubProjects()                                                returns array of Categories;
  function getMyWorkPackages()                                               returns array of Categories;


  // @cds.redirection.target
  // entity MyCategories     as projection on my.Categories;

  // entity Categories       as projection on my.Categories;
  entity Users2Categories as projection on my.Users2Categories;
  entity Tags             as projection on my.Tags;
  entity Tags2WorkItems   as projection on my.Tags2WorkItems;
  entity Tags2Categories  as projection on my.Tags2Categories;
  entity CategoryLevels   as projection on my.CategoryLevels;
  // entity MyUser           as projection on my.Users;
  entity Hierarchies      as projection on my.hierarchies.Hierarchies;
  entity Users            as projection on my.Users;

  @cds.redirection.target
  entity Categories       as projection on my.Categories;

  entity CategoriesLevel0 as projection on my.Categories where hierarchyLevel = '0';

  entity CategoriesLevel1 as projection on my.Categories {
    *,
    parent.ID    as level0,
    parent.title as level0Title,
  } where hierarchyLevel = '1';

  entity CategoriesLevel2 as projection on my.Categories {
    *,
    parent.ID           as level1,
    parent.parent.ID    as level0,
    parent.title        as level1Title,
    parent.parent.title as level0Title,
  } where hierarchyLevel = '2';

  entity CategoriesLevel3 as projection on my.Categories {
    *,
    parent.ID                  as level2,
    parent.parent.ID           as level1,
    parent.parent.parent.ID    as level0,
    parent.title               as level2Title,
    parent.parent.title        as level1Title,
    parent.parent.parent.title as level0Title,
  } where hierarchyLevel = '3';

// @cds.redirection.target
// entity Users            as projection on my.Users {
//   *,
//   workItems : redirected to MyWorkItems
// };

// entity Customers        as projection on my.Categories where hierarchyLevel = '0';

// entity Projects         as projection on my.Categories {
//   *,
//   parent.title as customerTitle
// } where hierarchyLevel = '1';

// entity SubProjects      as projection on my.Categories {
//   *,
//   parent.title        as projectTitle,
//   parent.parent.title as customerTitle
// } where hierarchyLevel = '2';

// entity WorkPackages     as projection on my.Categories {
//   *,
//   parent.title               as subProjectTitle,
//   parent.parent.title        as projectTitle,
//   parent.parent.parent.title as customerTitle
// } where hierarchyLevel = '3';
}
