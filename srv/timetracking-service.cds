using {iot.planner as my} from '../db/schema';
using {MSGraphService} from './msgraph-service';
// using {AzureDevopsService as AzDevOps} from './azure-devops';
// using {MSGraphService as MSGraph} from './msgraph-service';

service TimetrackingService @(requires : 'authenticated-user') {

  @cds.redirection.target : true
  entity MyWorkItems                                                            @(restrict : [
    {
      grant : 'READ',
      where : 'assignedTo_userPrincipalName = $user'
    },
    {
      grant : 'WRITE',
      to    : 'authenticated-user'
    }
  // ])                      as projection on my.WorkItems excluding {
  //   hierarchy
  // };
  ])                      as projection on my.WorkItems {
    key ID                                                                      @UI.Hidden,
        activatedDate                        as Datum             : String(10)  @(title : '{i18n>IOTWorkItems.Datum}'),
        completedDate                        as DatumBis          : String(10)  @(title : '{i18n>IOTWorkItems.DatumBis}')  @UI.Hidden : true,
        // Casting findet in work-items-service.js statt (mittels moment.js)
        ''                                   as Beginn            : String(5)   @(title : '{i18n>IOTWorkItems.Beginn}'),
        ''                                   as Ende              : String(5)   @(title : '{i18n>IOTWorkItems.Ende}'),
        ''                                   as P1                : String      @(title : '{i18n>IOTWorkItems.P1}'),
        hierarchy.level1Alias                as ProjektAlias      : String(150) @(title : '{i18n>IOTWorkItems.ProjektAlias}'),
        hierarchy.level2Alias                as TeilprojektAlias  : String(150) @(title : '{i18n>IOTWorkItems.TeilprojektAlias}'),
        hierarchy.level3Alias                as ArbeitspaketAlias : String(150) @(title : '{i18n>IOTWorkItems.ArbeitspaketAlias}'),
        'Durchführung'                       as Taetigkeit        : String(30)  @(title : '{i18n>IOTWorkItems.Taetigkeit}'),
        assignedTo.userPrincipalName         as Nutzer            : String      @(title : '{i18n>IOTWorkItems.Nutzer}'),
        'GE'                                 as Einsatzort        : String      @(title : '{i18n>IOTWorkItems.Einsatzort}'),
        title                                as Bemerkung         : String      @(title : '{i18n>IOTWorkItems.Bemerkung}'),
        @UI.Hidden
        tenant,
        @UI.Hidden
        assignedTo.manager.userPrincipalName as managerUserPrincipalName,
        // Ergaenzt für diesen Service
        activatedDate                        as activatedDate     : String(10)  @(title : '{i18n>IOTWorkItems.Datum}'),
        completedDate                        as completedDate     : String(10)  @(title : '{i18n>IOTWorkItems.DatumBis}')  @UI.Hidden : true,
        deleted,

  } where deleted is null;

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
}
