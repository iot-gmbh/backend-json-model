using {iot.planner as my} from '../db/schema';
// using {AzureDevopsService as AzDevOps} from './azure-devops';
// using {MSGraphService as MSGraph} from './msgraph-service';

service WorkItemsService @(requires : 'authenticated-user') {
  // entity AzDevWorkItems as projection on AzDevOps.WorkItems;
  // entity MSGraphEvents  as projection on MSGraph.Events;

  entity Hierarchies as projection on my.hierarchies.Hierarchies;

  @cds.redirection.target
  entity Categories  as projection on my.Categories;

  entity WorkItems @(restrict : [
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
  ])                 as projection on my.WorkItems {
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
  entity IOTWorkItems                                                           @(restrict : [
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
      where : 'Nutzer = $user'
    },
    {
      grant : 'READ',
      to    : 'admin',
    },
  ])                 as projection on my.WorkItems {
    key ID                                                                      @UI.Hidden,
        activatedDate                        as Datum             : String(10)  @(title : '{i18n>IOTWorkItems.Datum}'),
        completedDate                        as DatumBis          : String(10)  @(title : '{i18n>IOTWorkItems.DatumBis}')  @UI.Hidden : true,
        // Casting findet in work-items-service.js statt (mittels moment.js)
        ''                                   as Beginn            : String(5)   @(title : '{i18n>IOTWorkItems.Beginn}'),
        ''                                   as Ende              : String(5)   @(title : '{i18n>IOTWorkItems.Ende}'),
        ''                                   as P1                : String      @(title : '{i18n>IOTWorkItems.P1}'),
        // hierarchy.level0Title                as Kunde             : String @(title : '{i18n>IOTWorkItems.Kunde}'),
        // hierarchy.level0Title                as Projekt           : String @(title : '{i18n>IOTWorkItems.Projekt}'),
        hierarchy.level0Alias                as ProjektAlias      : String(150) @(title : '{i18n>IOTWorkItems.ProjektAlias}'),
        // hierarchy.level1Title                as Teilprojekt       : String @(title : '{i18n>IOTWorkItems.Teilprojekt}'),
        hierarchy.level1Alias                as TeilprojektAlias  : String(150) @(title : '{i18n>IOTWorkItems.TeilprojektAlias}'),
        // hierarchy.level2Title                as Arbeitspaket      : String @(title : '{i18n>IOTWorkItems.Arbeitspaket}'),
        hierarchy.level2Alias                as ArbeitspaketAlias : String(150) @(title : '{i18n>IOTWorkItems.ArbeitspaketAlias}'),
        'Durchführung'                       as Taetigkeit        : String(30)  @(title : '{i18n>IOTWorkItems.Taetigkeit}'),
        assignedTo.userPrincipalName         as Nutzer            : String      @(title : '{i18n>IOTWorkItems.Nutzer}'),
        'GE'                                 as Einsatzort        : String      @(title : '{i18n>IOTWorkItems.Einsatzort}'),
        title                                as Bemerkung         : String      @(title : '{i18n>IOTWorkItems.Bemerkung}'),
        @UI.Hidden
        tenant,
        @UI.Hidden
        assignedTo.manager.userPrincipalName as managerUserPrincipalName,
  } where deleted is null;

  /*
  IOT Projektaufschreibung

  Datum |	Von | Bis | P1 | Projekt | Teilprojekt | Arbeitspaket | Tätigkeit | Nutzer | Einsatzort | Bemerkung
   */

  entity Users       as projection on my.Users {
    *,
    workItems : redirected to WorkItems
  };
};
