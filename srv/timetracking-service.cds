using {iot.planner as my} from '../db/schema';
using {MSGraphService} from './msgraph-service';
// using {AzureDevopsService as AzDevOps} from './azure-devops';
// using {MSGraphService as MSGraph} from './msgraph-service';

service TimetrackingService @(requires : 'authenticated-user') {

  entity WorkItems @(restrict : [
    // {
    //   grant : '*',
    //   to    : 'admin',
    // },
    // {
    //   grant : 'READ',
    //   to    : 'team-lead',
    //   // Association paths are currently supported on SAP HANA only
    //   // https://cap.cloud.sap/docs/guides/authorization#association-paths
    //   where : 'managerUserPrincipalName = $user'
    // },
    // {
    //   grant : 'READ',
    //   to    : 'project-lead',
    //   where : 'hierarchy.level1 = '
    // },
    // {
    //   grant : '*',
    //   to    : 'authenticated-user',
    //   where : 'assignedToUserPrincipalName = $user'
    // },
    {
      grant : 'READ',
      to    : 'team-lead',
      // Association paths are currently supported on SAP HANA only
      // https://cap.cloud.sap/docs/guides/authorization#association-paths
      where : 'managerUserPrincipalName = $user'
    },
    {
      grant : 'READ',
      to    : 'authenticated-user',
      where : 'assignedToUserPrincipalName = $user'
    },
    {
      grant : 'READ',
      to    : 'admin',
    },

  ])                      as projection on my.WorkItems {
    *,
    assignedTo.userPrincipalName         as assignedToUserPrincipalName,
    assignedTo.manager.userPrincipalName as managerUserPrincipalName,
  // hierarchy.level0                     as customer,
  // hierarchy.level1                     as project,
  // hierarchy.level2                     as subProject,
  // hierarchy.level3                     as workPackage,
  // hierarchy.level0Title                as customerText,
  // hierarchy.level1Title                as projectText,
  // hierarchy.level2Title                as subProjectText,
  // hierarchy.level3Title                as workPackageText
  } where deleted is null

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
  ])                      as projection on my.WorkItems {

    key ID           @UI.Hidden,
        *,
        hierarchy.level0Alias        as customerAlias    : String(150),
        hierarchy.level1Alias        as projectAlias     : String(150),
        hierarchy.level2Alias        as subProjectAlias  : String(150),
        hierarchy.level3Alias        as workPackageAlias : String(150),
        assignedTo.userPrincipalName as user             : String,


  } where deleted is null;

  // @cds.redirection.target : true
  // entity MyWorkItems @(restrict : [
  //   {
  //     grant : 'READ',
  //     where : 'assignedTo_userPrincipalName = $user'
  //   },
  //   {
  //     grant : 'WRITE',
  //     to    : 'authenticated-user'
  //   }
  // ])                      as projection on my.WorkItems excluding {
  //   hierarchy
  // };

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
  function getMyCategoryTree()                                               returns array of MyCategories;

  @cds.redirection.target
  entity MyCategories     as projection on my.Categories;

  entity Categories       as projection on my.Categories;
  entity Users2Categories as projection on my.Users2Categories;
  entity Tags             as projection on my.Tags;
  entity Tags2WorkItems   as projection on my.Tags2WorkItems;
  entity Tags2Categories  as projection on my.Tags2Categories;
  entity CategoryLevels   as projection on my.CategoryLevels;
  // entity MyUser           as projection on my.Users;
  entity Hierarchies      as projection on my.hierarchies.Hierarchies;

  @cds.redirection.target
  entity Users            as projection on my.Users {
    *,
    workItems : redirected to WorkItems
  };

  entity Customers        as projection on my.Categories where hierarchyLevel = '0';

  entity Projects         as projection on my.Categories {
    *,
    parent.title as customerTitle
  } where hierarchyLevel = '1';

  entity SubProjects      as projection on my.Categories {
    *,
    parent.title        as projectTitle,
    parent.parent.title as customerTitle
  } where hierarchyLevel = '2';

  entity WorkPackages     as projection on my.Categories {
    *,
    parent.title               as subProjectTitle,
    parent.parent.title        as projectTitle,
    parent.parent.parent.title as customerTitle
  } where hierarchyLevel = '3';
}
