using {iot.planner as my} from '../db/schema';
using {AzureDevopsService as AzDevOps} from './azure-devops';
using {MSGraphService as MSGraph} from './msgraph-service';

service WorkItemsService @(requires : 'authenticated-user') {
    entity AzDevWorkItems as projection on AzDevOps.WorkItems;
    entity MSGraphEvents  as projection on MSGraph.Events;

    entity WorkItems @(restrict : [
        {
            grant : 'READ',
            to    : 'team-lead',
            // Association paths are currently supported on SAP HANA only
            // https://cap.cloud.sap/docs/guides/authorization#association-paths
            where : 'assignedTo.manager_userPrincipalName = $user'
        },
        {
            grant : 'READ',
            to    : 'authenticated-user',
            where : 'assignedTo_userPrincipalName = $user'
        },
        {
            grant : 'READ',
            to    : 'admin',
        },
    ])                    as
        select from my.WorkItems
        where
                project.friendlyID  != 'DELETED'
            and customer.friendlyID != 'DELETED';

    entity IOTWorkItems   as
        select from WorkItems {
            activatedDate            as Datum        : String @(title : '{i18n>IOTWorkItems.Datum}'),
            completedDate            as DatumBis     : String @(title : '{i18n>IOTWorkItems.DatumBis}')  @UI.Hidden : true,
            ''                       as Beginn       : String @(title : '{i18n>IOTWorkItems.Beginn}'),
            ''                       as Ende         : String @(title : '{i18n>IOTWorkItems.Ende}'),
            ''                       as P1           : String @(title : '{i18n>IOTWorkItems.P1}'),
            project.IOTProjectID     as Projekt      : String @(title : '{i18n>IOTWorkItems.Projekt}'),
            ''                       as Teilprojekt  : String @(title : '{i18n>IOTWorkItems.Teilprojekt}'),
            workPackage.IOTPackageID as Arbeitspaket : String @(title : '{i18n>IOTWorkItems.Arbeitspaket}'),
            'Durchführung'           as Taetigkeit   : String @(title : '{i18n>IOTWorkItems.Taetigkeit}'),
            'GE'                     as Einsatzort   : String @(title : '{i18n>IOTWorkItems.Einsatzort}'),
            ''                       as P2           : String @(title : '{i18n>IOTWorkItems.P2}'),
            title                    as Bemerkung    : String @(title : '{i18n>IOTWorkItems.Bemerkung}'),
            @UI.Hidden
            assignedTo.userPrincipalName

        /*
        IOT Projektaufschreibung

        Datum |	Von | Bis | P1 | Projekt | Teilprojekt | Arbeitspaket | Tätigkeit | Einsatzort | P2 | Bemerkung
         */
        };

    entity Users          as projection on my.Users {
        * , workItems : redirected to WorkItems
    };

    entity Projects       as projection on my.Projects {
        * , workItems : redirected to WorkItems
    } where friendlyID != 'DELETED';

    entity Customers      as projection on my.Customers where friendlyID != 'DELETED';
};
