using {
    Currency,
    cuid,
    managed,
    sap
} from '@sap/cds/common';

namespace iot.planner;

@assert.unique : {friendlyID : [userPrincipalName, ]}
entity Users {
    key userPrincipalName : String;
        displayName       : String;
        givenName         : String;
        jobTitle          : String;
        mail              : String;
        mobilePhone       : String;
        officeLocation    : String;
        preferredLanguage : String;
        surname           : String;
        manager           : Association to Users;
        projects          : Association to many Users2Projects
                                on projects.user = $self;
        managedProjects   : Association to many Projects
                                on managedProjects.manager = $self;
        teamMembers       : Association to many Users
                                on teamMembers.manager = $self;
        workItems         : Association to many WorkItems
                                on workItems.assignedTo = $self;
};

@assert.unique : {friendlyID : [
    user,
    project
]}
entity Users2Projects : cuid, managed {
    user    : Association to Users;
    project : Association to Projects;
};

@assert.unique : {friendlyID : [friendlyID]}
entity Customers : managed, cuid {
    friendlyID : String @mandatory;
    name       : String;
    projects   : Association to many Projects
                     on projects.customer = $self;
}

@assert.unique : {friendlyID : [
    customer_friendlyID,
    friendlyID
]}
entity Projects : managed, cuid {
    friendlyID          : String @mandatory;
    title               : String @mandatory;
    description         : String;
    IOTProjectID        : String;
    manager             : Association to Users;
    customer_friendlyID : String;
    customer            : Association to Customers;
    workPackages        : Composition of many Packages
                              on workPackages.project = $self;
    teamMembers         : Composition of many Users2Projects
                              on teamMembers.project = $self;
    workItems           : Association to many WorkItems
                              on workItems.project = $self;
}

entity Packages : managed, cuid {
    project     : Association to Projects;
    title       : String @mandatory;
    description : String;
}

entity WorkItems {
    key ID                  : String;
        activatedDate       : DateTime;
        activatedDateMonth  : Integer;
        activatedDateYear   : Integer;
        activatedDateDay    : Integer;
        completedDate       : DateTime;
        completedDateMonth  : Integer;
        completedDateYear   : Integer;
        completedDateDay    : Integer;
        assignedTo          : Association to Users;
        changedDate         : DateTime;
        assignedToName      : String;
        createdDate         : DateTime;
        reason              : String;
        state               : String;
        teamProject         : String;
        title               : String;
        workItemType        : String;
        // Scheduling
        completedWork       : Decimal;
        remainingWork       : Decimal;
        originalEstimate    : Decimal;
        // Documentation
        resolvedDate        : DateTime;
        closedDate          : DateTime;
        customer_friendlyID : String;
        customer            : Association to Customers;
        customerName        : String;
        private             : Boolean;
        // Custom
        project_friendlyID  : String;
        project             : Association to Projects;
        projectTitle        : String;
        workPackage         : Association to Packages;
        ticket              : String;
        type                : String enum {
            Manual;
            Event;
            WorkItem
        };
        duration            : Decimal;
        resetEntry          : Boolean;
        deleted             : Boolean;
        confirmed           : Boolean;
};
