using {
    Currency,
    managed,
    cuid,
    sap
} from '@sap/cds/common';

namespace iot.planner;

entity Users {
    key userPrincipalName : String                              @title : '{i18n>Users.principalName}';
        displayName       : String                              @title : '{i18n>Users.displayName}';
        givenName         : String                              @title : '{i18n>Users.givenName}';
        jobTitle          : String                              @title : '{i18n>Users.jobTitle}';
        mail              : String                              @title : '{i18n>Users.mail}';
        mobilePhone       : String                              @title : '{i18n>Users.mobilePhone}';
        officeLocation    : String                              @title : '{i18n>Users.officeLocation}';
        preferredLanguage : String                              @title : '{i18n>Users.preferredLanguage}';
        surname           : String                              @title : '{i18n>Users.surname}';
        manager           : Association to Users                @title : '{i18n>Users.manager}';
        projects          : Association to many Projects
                                on projects.manager = $self     @title : '{i18n>Users.projects}';
        team              : Association to many Users
                                on team.manager = $self         @title : '{i18n>Users.team}';
        workItems         : Association to many WorkItems
                                on workItems.assignedTo = $self @title : '{i18n>Users.workItems}';
};

@assert.unique : {friendlyID : [friendlyID]}
entity Customers : managed, cuid {
    friendlyID : String                           @title : '{i18n>Customers.friendlyID}'  @mandatory : true;
    name       : String                           @title : '{i18n>Customers.name}';
    projects   : Association to many Projects
                     on projects.customer = $self @title : '{i18n>Customers.projects}'
}

@assert.unique : {friendlyID : [friendlyID]}
entity Projects : managed, cuid {
    friendlyID   : String                   @title : '{i18n>Projects.friendlyID}'  @mandatory : true;
    title        : String                   @title : '{i18n>Projects.title}';
    description  : String                   @title : '{i18n>Projects.description}';
    customer     : Association to Customers @title : '{i18n>Projects.customer}';
    manager      : Association to Users     @title : '{i18n>Projects.manager}';
    IOTProjectID : String                   @title : '{i18n>Projects.IOTProjectID}';
    workItems    : Association to many WorkItems
                       on workItems.project = $self
                                            @title : '{i18n>Projects.workItems}'
}

/*
IOT Projektaufschreibung

Datum |	Von | Bis | P1 | Projekt | Teilprojekt | Arbeitspaket | Tätigkeit | Einsatzort | P2 | Bemerkung
 */


entity WorkItems {
    key ID                  : String                                           @title : '{i18n>WorkItems.ID}';
        activatedDate       : DateTime                                         @title : '{i18n>WorkItems.activatedDate}';
        completedDate       : DateTime                                         @title : '{i18n>WorkItems.completedDate}';
        assignedTo          : Association to Users                             @title : '{i18n>WorkItems.assignedTo}';
        changedDate         : DateTime                                         @title : '{i18n>WorkItems.changedDate}';
        assignedToName      : String                                           @title : '{i18n>WorkItems.assignedToName}';
        createdDate         : DateTime                                         @title : '{i18n>WorkItems.createdDate}';
        reason              : String                                           @title : '{i18n>WorkItems.reason}';
        state               : String                                           @title : '{i18n>WorkItems.state}';
        teamProject         : String                                           @title : '{i18n>WorkItems.teamProject}';
        title               : String                                           @title : '{i18n>WorkItems.title}';
        workItemType        : String                                           @title : '{i18n>WorkItems.workItemType}';
        // Scheduling
        completedWork       : Decimal                                          @title : '{i18n>WorkItems.completedWork}';
        remainingWork       : Decimal                                          @title : '{i18n>WorkItems.remainingWork}';
        originalEstimate    : Decimal                                          @title : '{i18n>WorkItems.originalEstimate}';
        // Documentation
        resolvedDate        : DateTime                                         @title : '{i18n>WorkItems.resolvedDate}';
        closedDate          : DateTime                                         @title : '{i18n>WorkItems.closedDate}';
        customer_friendlyID : String                                           @title : '{i18n>WorkItems.customer}'  @mandatory;
        customer            : Association to Customers
                                  on customer.friendlyID = customer_friendlyID @title : '{i18n>WorkItems.customer}';
        customerName        : String                                           @title : '{i18n>WorkItems.customerName}';
        private             : Boolean                                          @title : '{i18n>WorkItems.private}';
        // Custom
        project_friendlyID  : String                                           @title : '{i18n>WorkItems.project}'  @mandatory;
        project             : Association to Projects
                                  on project.friendlyID = project_friendlyID   @title : '{i18n>WorkItems.project}';
        projectName         : String                                           @title : '{i18n>WorkItems.projectName}';
        ticket              : String                                           @title : '{i18n>WorkItems.ticket}';
        type                : String                                           @title : '{i18n>WorkItems.type}' enum {
            Manual;
            Event;
            WorkItem
        };
        duration            : Decimal                                          @title : '{i18n>WorkItems.duration}';
        resetEntry          : Boolean;
        deleted             : Boolean;
        confirmed           : Boolean;
};
