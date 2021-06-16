using {
    Currency,
    managed,
    cuid,
    sap
} from '@sap/cds/common';

namespace iot.planner;

@assert.unique : {friendlyID : [userPrincipalName, ]}
entity Users {
    key userPrincipalName : String                                 @title : '{i18n>Users.principalName}';
        displayName       : String                                 @title : '{i18n>Users.displayName}';
        givenName         : String                                 @title : '{i18n>Users.givenName}';
        jobTitle          : String                                 @title : '{i18n>Users.jobTitle}';
        mail              : String                                 @title : '{i18n>Users.mail}';
        mobilePhone       : String                                 @title : '{i18n>Users.mobilePhone}';
        officeLocation    : String                                 @title : '{i18n>Users.officeLocation}';
        preferredLanguage : String                                 @title : '{i18n>Users.preferredLanguage}';
        surname           : String                                 @title : '{i18n>Users.surname}';
        manager           : Association to Users                   @title : '{i18n>Users.manager}';
        projects          : Association to many Users2Projects
                                on projects.user = $self
                                                                   @title : '{i18n>Users.projects}';
        managedProjects   : Association to many Projects
                                on managedProjects.manager = $self @title : '{i18n>Users.managedProjects}';
        teamMembers       : Association to many Users
                                on teamMembers.manager = $self     @title : '{i18n>Users.teamMembers}';
        workItems         : Association to many WorkItems
                                on workItems.assignedTo = $self    @title : '{i18n>Users.workItems}';
};

@assert.unique : {friendlyID : [
    user,
    project
]}
entity Users2Projects : cuid, managed {
    user    : Association to Users    @title : '{i18n>Users2Projects.user}';
    project : Association to Projects @title : '{i18n>Users2Projects.project}'
};

@assert.unique : {friendlyID : [friendlyID]}
entity Customers : managed, cuid {
    friendlyID : String                           @title : '{i18n>Customers.friendlyID}'  @mandatory;
    name       : String                           @title : '{i18n>Customers.name}';
    projects   : Composition of many Projects
                     on projects.customer = $self @title : '{i18n>Customers.projects}'
}

@assert.unique : {friendlyID : [
    customer_friendlyID,
    friendlyID
]}
entity Projects : managed, cuid {
    friendlyID          : String                   @title : '{i18n>Projects.friendlyID}'  @mandatory;
    title               : String                   @title : '{i18n>Projects.title}';
    description         : String                   @title : '{i18n>Projects.description}';
    customer_friendlyID : String                   @title : '{i18n>Projects.customerFriendlyID}'  @mandatory;
    customer            : Association to Customers @title : '{i18n>Projects.customer}';
    manager             : Association to Users     @title : '{i18n>Projects.manager}';
    IOTProjectID        : String                   @title : '{i18n>Projects.IOTProjectID}';
    teamMembers         : Composition of many Users2Projects
                              on teamMembers.project = $self
                                                   @title : '{i18n>Projects.teamMembers}';
    workItems           : Association to many WorkItems
                              on  workItems.project_friendlyID  = friendlyID
                              and workItems.customer_friendlyID = customer_friendlyID
                                                   @title : '{i18n>Projects.workItems}'
}

/*
IOT Projektaufschreibung

Datum |	Von | Bis | P1 | Projekt | Teilprojekt | Arbeitspaket | Tätigkeit | Einsatzort | P2 | Bemerkung
 */
entity WorkItems {
    key ID                           : String   @title : '{i18n>WorkItems.ID}';
        activatedDate                : DateTime @title : '{i18n>WorkItems.activatedDate}';
        activatedDateMonth           : Integer  @title : '{i18n>WorkItems.activatedDateMonth}';
        activatedDateYear            : Integer  @title : '{i18n>WorkItems.activatedDateYear}';
        activatedDateDay             : Integer  @title : '{i18n>WorkItems.activatedDateDay}';
        completedDate                : DateTime @title : '{i18n>WorkItems.completedDate}';
        completedDateMonth           : Integer  @title : '{i18n>WorkItems.completedDateMonth}';
        completedDateYear            : Integer  @title : '{i18n>WorkItems.completedDateYear}';
        completedDateDay             : Integer  @title : '{i18n>WorkItems.completedDateDay}';
        assignedTo_userPrincipalName : String   @title : '{i18n>WorkItems.assignedTo}';
        assignedTo                   : Association to Users
                                           on assignedTo.userPrincipalName = assignedTo_userPrincipalName
                                                @title : '{i18n>WorkItems.assignedTo}';
        changedDate                  : DateTime @title : '{i18n>WorkItems.changedDate}';
        assignedToName               : String   @title : '{i18n>WorkItems.assignedToName}';
        createdDate                  : DateTime @title : '{i18n>WorkItems.createdDate}';
        reason                       : String   @title : '{i18n>WorkItems.reason}';
        state                        : String   @title : '{i18n>WorkItems.state}';
        teamProject                  : String   @title : '{i18n>WorkItems.teamProject}';
        title                        : String   @title : '{i18n>WorkItems.title}';
        workItemType                 : String   @title : '{i18n>WorkItems.workItemType}';
        // Scheduling
        completedWork                : Decimal  @title : '{i18n>WorkItems.completedWork}';
        remainingWork                : Decimal  @title : '{i18n>WorkItems.remainingWork}';
        originalEstimate             : Decimal  @title : '{i18n>WorkItems.originalEstimate}';
        // Documentation
        resolvedDate                 : DateTime @title : '{i18n>WorkItems.resolvedDate}';
        closedDate                   : DateTime @title : '{i18n>WorkItems.closedDate}';
        customer_friendlyID          : String   @title : '{i18n>WorkItems.customer}'  @mandatory;
        customer                     : Association to Customers
                                           on customer.friendlyID = customer_friendlyID
                                                @title : '{i18n>WorkItems.customer}';
        customerName                 : String   @title : '{i18n>WorkItems.customerName}';
        private                      : Boolean  @title : '{i18n>WorkItems.private}';
        // Custom
        project_friendlyID           : String   @title : '{i18n>WorkItems.project}'  @mandatory;
        project                      : Association to Projects
                                           on  project.friendlyID          = project_friendlyID
                                           and project.customer_friendlyID = customer_friendlyID
                                                @title : '{i18n>WorkItems.project}';
        projectName                  : String   @title : '{i18n>WorkItems.projectName}';
        ticket                       : String   @title : '{i18n>WorkItems.ticket}';
        type                         : String   @title : '{i18n>WorkItems.type}' enum {
            Manual;
            Event;
            WorkItem
        };
        duration                     : Decimal  @title : '{i18n>WorkItems.duration}';
        resetEntry                   : Boolean  @title : '{i18n>WorkItems.resetEntry}';
        deleted                      : Boolean  @title : '{i18n>WorkItems.deleted}';
        confirmed                    : Boolean  @title : '{i18n>WorkItems.confirmed}';
};
