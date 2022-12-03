using {iot.planner as my} from '../db/schema';
using {MSGraphService} from './msgraph-service';
// using {AzureDevopsService as AzDevOps} from './azure-devops';
// using {MSGraphService as MSGraph} from './msgraph-service';

service TimetrackingService @(requires : 'authenticated-user') {

  @odata.create.enabled
  @odata.update.enabled
  entity MyWorkItems                                                    @(restrict : [
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
    {
      grant : '*',
      to    : 'project-lead',
      where : '$user = level0Manager',
    },
    {
      grant : '*',
      to    : 'project-lead',
      where : '$user = level1Manager',
    },
    {
      grant : '*',
      to    : 'project-lead',
      where : '$user = level2Manager',
    },
    {
      grant : '*',
      to    : 'project-lead',
      where : '$user = level3Manager',
    },
    {
      grant : '*',
      to    : 'authenticated-user',
      where : 'assignedToUserPrincipalName = $user'
    },
  ])                      as projection on my.WorkItems {
    *,
    // TO_CHAR(
    TO_CHAR(
      activatedDate, 'YYYY-MM-DD'
    )                                    as date : String               @(title : 'Date'),
    activatedDate                                                       @(title : 'Activated Date'),
    assignedTo.userPrincipalName         as assignedToUserPrincipalName @(title : 'User'),
    assignedTo.manager.userPrincipalName as managerUserPrincipalName    @(title : 'Manager'),
    // hierarchy.level1.manager.userPrincipalName as hierarchyLevel1ManagerUserPrincipalName,
    // hierarchy.level0                     as level0
    // default '2e74e68d-57c3-4e0b-9cb9-52cfaf7dbfcb',
    // hierarchy.level1                     as level1
    // default '2e74e68d-57c3-4e0b-9cb9-52cfaf7dbfcb',
    // hierarchy.level2                     as level2
    // default '2e74e68d-57c3-4e0b-9cb9-52cfaf7dbfcb',
    // hierarchy.level3                     as level3
    // default '2e74e68d-57c3-4e0b-9cb9-52cfaf7dbfcb',
    hierarchy.level0Title                as level0Title,
    hierarchy.level1Title                as level1Title,
    hierarchy.level2Title                as level2Title,
    hierarchy.level3Title                as level3Title,
    hierarchy.level0Alias                as level0Alias,
    hierarchy.level1Alias                as level1Alias,
    hierarchy.level2Alias                as level2Alias,
    hierarchy.level3Alias                as level3Alias,
    hierarchy.level0Manager              as level0Manager,
    hierarchy.level1Manager              as level1Manager,
    hierarchy.level2Manager              as level2Manager,
    hierarchy.level3Manager              as level3Manager

  }
  // where deleted is null

  @cds.redirection.target : true
  entity WorkItemsFastEntry @(restrict : [
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
  function getMySubprojects()                                                returns array of Categories;
  function getMyWorkPackages()                                               returns array of Categories;
  entity Users            as projection on my.Users;
  entity Users2Categories as projection on my.Users2Categories;
  entity Tags             as projection on my.Tags;
  entity Tags2Categories  as projection on my.Tags2Categories;
  entity Tags2WorkItems   as projection on my.Tags2WorkItems;
  entity CategoryLevels   as projection on my.CategoryLevels;
  entity Hierarchies      as projection on my.hierarchies.Hierarchies;

  @cds.redirection.target
  entity Categories       as projection on my.Categories where validFrom <= NOW()
  and                                                          validTo   >  NOW();

  entity CategoriesLevel0 as projection on Categories {
        *,
    key ID    @(title : 'Customer'),
        title @(title : 'Customer')
  } where hierarchyLevel = '0';

  entity CategoriesLevel1 as projection on Categories {
        *,
    key ID                          @(title : 'Project'),
        title                       @(title : 'Project'),
        parent.ID    as level0ID    @(title : 'Customer'),
        parent.title as level0Title @(title : 'Customer'),
  } where hierarchyLevel = '1';

  entity CategoriesLevel2 as projection on Categories {
        *,
    key ID                                 @(title : 'Subproject'),
        title                              @(title : 'Subproject'),
        parent.ID           as level1ID    @(title : 'Project'),
        parent.title        as level1Title @(title : 'Project'),
        parent.parent.ID    as level0ID    @(title : 'Customer'),
        parent.parent.title as level0Title @(title : 'Customer'),
  } where hierarchyLevel = '2';

  entity CategoriesLevel3 as projection on Categories {
        *,
    key ID                                        @(title : 'Package'),
        title                                     @(title : 'Package'),
        parent.ID                  as level2ID    @(title : 'Subproject'),
        parent.title               as level2Title @(title : 'Subproject'),
        parent.parent.ID           as level1ID    @(title : 'Project'),
        parent.parent.title        as level1Title @(title : 'Project'),
        parent.parent.parent.ID    as level0ID    @(title : 'Customer'),
        parent.parent.parent.title as level0Title @(title : 'Customer'),
  } where hierarchyLevel = '3';
}
