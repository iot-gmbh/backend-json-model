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
                                on workItems.assignedTo_userPrincipalName = userPrincipalName
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
    packages            : Composition of many Packages
                              on packages.project = $self;
    teamMembers         : Composition of many Users2Projects
                              on teamMembers.project = $self;
    workItems           : Association to many WorkItems
                              on  workItems.project_friendlyID  = friendlyID
                              and workItems.customer_friendlyID = customer_friendlyID;
}

entity Packages : managed, cuid {
    project     : Association to Projects;
    title       : String @mandatory;
    description : String;
}

entity WorkItems {
    key ID                           : String;
        activatedDate                : DateTime;
        activatedDateMonth           : Integer;
        activatedDateYear            : Integer;
        activatedDateDay             : Integer;
        completedDate                : DateTime;
        completedDateMonth           : Integer;
        completedDateYear            : Integer;
        completedDateDay             : Integer;
        assignedTo_userPrincipalName : String;
        assignedTo                   : Association to Users
                                           on assignedTo.userPrincipalName = assignedTo_userPrincipalName;
        changedDate                  : DateTime;
        assignedToName               : String;
        createdDate                  : DateTime;
        reason                       : String;
        state                        : String;
        teamProject                  : String;
        title                        : String;
        workItemType                 : String;
        // Scheduling
        completedWork                : Decimal;
        remainingWork                : Decimal;
        originalEstimate             : Decimal;
        // Documentation
        resolvedDate                 : DateTime;
        closedDate                   : DateTime;
        customer_friendlyID          : String;
        customer                     : Association to Customers
                                           on customer.friendlyID = customer_friendlyID;
        customerName                 : String;
        private                      : Boolean;
        // Custom
        project_friendlyID           : String;
        project                      : Association to Projects
                                           on  project.friendlyID          = project_friendlyID
                                           and project.customer_friendlyID = customer_friendlyID;
        projectName                  : String;
        ticket                       : String;
        type                         : String enum {
            Manual;
            Event;
            WorkItem
        };
        duration                     : Decimal;
        resetEntry                   : Boolean;
        deleted                      : Boolean;
        confirmed                    : Boolean;
};
