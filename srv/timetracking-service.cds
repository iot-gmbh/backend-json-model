using {iot.planner as my} from '../db/schema';
using {MSGraphService} from './msgraph-service';

service TimetrackingService @(requires: 'authenticated-user') {

  @odata.create.enabled
  @odata.update.enabled
  entity MyWorkItems                                                    @(restrict: [{
    grant: '*',
    to   : 'authenticated-user',
    where: `assignedToUserPrincipalName = $user or 
        managerUserPrincipalName = $user or
        level0Manager = $user or 
        level1Manager = $user or 
        level2Manager = $user or 
        level3Manager = $user
        `,
  }, ])                   as projection on my.WorkItems {
    *,
    // TO_CHAR(
    TO_CHAR(
      activatedDate, 'YYYY-MM-DD'
    )                                    as dateString : String         @(title: 'Date (String)'),
    activatedDate                        as date                        @(title: 'Date'),
    activatedDate                                                       @(title: 'Activated Date'),
    assignedTo.userPrincipalName         as assignedToUserPrincipalName @(title: 'User'),
    assignedTo.manager.userPrincipalName as managerUserPrincipalName    @(title: 'Manager'),
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
  };

  // where deleted is null

  /*
  IOT Projektaufschreibung

  Datum |	Von | Bis | P1 | Projekt | Teilprojekt | Arbeitspaket | Tätigkeit | Nutzer | Einsatzort | Bemerkung
   */
  // @cds.redirection.target: true
  entity IOTWorkItems     as projection on my.WorkItems {
    key ID                                                                      @UI.Hidden,
        activatedDate                        as Datum             : String(10)  @(title: '{i18n>IOTWorkItems.Datum}'),
        completedDate                        as DatumBis          : String(10)  @(title: '{i18n>IOTWorkItems.DatumBis}')  @UI.Hidden: true,
        // Casting findet in work-items-service.js statt (mittels moment.js)
        ''                                   as Beginn            : String(5)   @(title: '{i18n>IOTWorkItems.Beginn}'),
        ''                                   as Ende              : String(5)   @(title: '{i18n>IOTWorkItems.Ende}'),
        ''                                   as P1                : String      @(title: '{i18n>IOTWorkItems.P1}'),
        hierarchy.level1Alias                as ProjektAlias      : String(150) @(title: '{i18n>IOTWorkItems.ProjektAlias}'),
        hierarchy.level2Alias                as TeilprojektAlias  : String(150) @(title: '{i18n>IOTWorkItems.TeilprojektAlias}'),
        hierarchy.level3Alias                as ArbeitspaketAlias : String(150) @(title: '{i18n>IOTWorkItems.ArbeitspaketAlias}'),
        'Durchführung'                       as Taetigkeit        : String(30)  @(title: '{i18n>IOTWorkItems.Taetigkeit}'),
        assignedTo.userPrincipalName         as Nutzer            : String      @(title: '{i18n>IOTWorkItems.Nutzer}'),
        'GE'                                 as Einsatzort        : String      @(title: '{i18n>IOTWorkItems.Einsatzort}'),
        title                                as Bemerkung         : String      @(title: '{i18n>IOTWorkItems.Bemerkung}'),
        @UI.Hidden
        tenant,
        @UI.Hidden
        assignedTo.manager.userPrincipalName as managerUserPrincipalName,
  } where deleted is null;

  @cds.redirection.target: true
  entity WorkItemsFastEntry @(restrict: [
    {
      grant: 'READ',
      where: 'assignedTo_userPrincipalName = $user and tenant = $user.tenant'
    },
    {
      grant: 'WRITE',
      to   : 'authenticated-user'
    }
  ])                      as projection on my.WorkItems excluding {
    hierarchy
  };

  entity MSGraphWorkItems as projection on MSGraphService.WorkItems {
    key ID                       : String @odata.Type: 'Edm.String',
        title,
        activatedDate,
        completedDate,
        isPrivate,
        isAllDay,
        location,
        'MSGraphEvent' as source : String
  };

  entity WorkItemsSlim    as projection on MyWorkItems {
    key ID,
        activatedDate,
        completedDate,
        date,
        dateString,
        confirmed,
        duration,
        isAllDay,
        isPrivate,
        location,
        parentPath,
        parent.ID                    as parent_ID,
        assignedTo.userPrincipalName as assignedTo_userPrincipalName,
        title,
        type
  };

  action   removeDraft(ID : String, activatedDate : DateTime, completedDate : DateTime);
  action   resetToDraft(ID : String)                                         returns MyWorkItems;
  function getCalendarView(startDateTime : DateTime, endDateTime : DateTime) returns array of WorkItemsSlim;
  function getWorkItemByID(ID : String)                                      returns MyWorkItems;
  function categorizeWorkItem(workItem : MyWorkItems)                        returns MyWorkItems;
  function getMyCategoryTree()                                               returns array of CategoriesSlim;
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

  entity CategoriesSlim   as projection on Categories {
    key ID,
        parent.ID as parent_ID,
        title,
        path,
        absoluteReference,
        shallowReference,
        deepReference,
  };

  entity CategoriesLevel0 as projection on Categories {
        *,
    key ID    @(title: 'Customer'),
        title @(title: 'Customer')
  } where hierarchyLevel = '0';

  entity CategoriesLevel1 as projection on Categories {
        *,
    key ID                          @(title: 'Project'),
        title                       @(title: 'Project'),
        parent.ID    as level0ID    @(title: 'Customer'),
        parent.title as level0Title @(title: 'Customer'),
  } where hierarchyLevel = '1';

  entity CategoriesLevel2 as projection on Categories {
        *,
    key ID                                 @(title: 'Subproject'),
        title                              @(title: 'Subproject'),
        parent.ID           as level1ID    @(title: 'Project'),
        parent.title        as level1Title @(title: 'Project'),
        parent.parent.ID    as level0ID    @(title: 'Customer'),
        parent.parent.title as level0Title @(title: 'Customer'),
  } where hierarchyLevel = '2';

  entity CategoriesLevel3 as projection on Categories {
        *,
    key ID                                        @(title: 'Package'),
        title                                     @(title: 'Package'),
        parent.ID                  as level2ID    @(title: 'Subproject'),
        parent.title               as level2Title @(title: 'Subproject'),
        parent.parent.ID           as level1ID    @(title: 'Project'),
        parent.parent.title        as level1Title @(title: 'Project'),
        parent.parent.parent.ID    as level0ID    @(title: 'Customer'),
        parent.parent.parent.title as level0Title @(title: 'Customer'),
  } where hierarchyLevel = '3';
}
