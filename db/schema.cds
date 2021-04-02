using {
    Currency,
    managed,
    cuid,
    sap
} from '@sap/cds/common';

namespace iot.planner;

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
        workItems         : Association to many WorkItems
                                on workItems.assignedTo = $self;
};

@assert.unique : {friendlyID : [friendlyID]}
entity Customers : managed, cuid {
    friendlyID : String @mandatory : true
                        @title     : '{i18n>Customers.friendlyID}';
    name       : String @title     : '{i18n>Customers.name}';
    projects   : Composition of many Projects
                     on projects.customer = $self;
}

@assert.unique : {friendlyID : [friendlyID]}
entity Projects : managed, cuid {
    friendlyID  : String @mandatory : true
                         @title     : '{i18n>Projects.friendlyID}';
    title       : String @title     : '{i18n>Projects.title}';
    description : String @title     : '{i18n>Projects.description}';
    customer    : Association to Customers;
    manager     : Association to Users;
    workItems   : Association to many WorkItems
                      on workItems.project = $self;
}

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
        customer_friendlyID : String;
        customer            : Association to Customers
                                  on customer.friendlyID = customer_friendlyID @title : '{i18n>WorkItems.customer}';
        customerName        : String                                           @title : '{i18n>WorkItems.customerName}';
        private             : Boolean                                          @title : '{i18n>WorkItems.private}';
        // Custom
        project_friendlyID  : String;
        project             : Association to Projects
                                  on project.friendlyID = project_friendlyID   @title : '{i18n>WorkItems.project}';
        projectName         : String                                           @title : '{i18n>WorkItems.projectName}';
        ticket              : String                                           @title : '{i18n>WorkItems.ticket}';
        type                : String                                           @title : '{i18n>WorkItems.type}';
        duration            : Decimal                                          @title : '{i18n>WorkItems.duration}'
};
