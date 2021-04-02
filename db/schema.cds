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

entity Employees : managed {
    key ID    : String;
        name  : String @title : '{i18n>Employees.name}';
        tasks : Association to many Tasks
                    on tasks.personResponsible = $self;
}

@assert.unique : {friendlyID : [friendlyID]}
entity Customers : managed, cuid {
    // key ID         : String;
    friendlyID : String @mandatory : true
                        @title     : '{i18n>Customers.friendlyID}';
    name       : String @title     : '{i18n>Customers.name}';
    projects   : Association to many Projects
                     on projects.customer = $self;
}

entity Projects : managed {
    key ID          : String;
        title       : String @title : '{i18n>Projects.title}';
        description : String @title : '{i18n>Projects.description}';
        customer    : Association to Customers;
        manager     : Association to Employees;
        tasks       : Association to many Tasks
                          on tasks.project = $self;
        workItems   : Association to many WorkItems
                          on workItems.project = $self;
}

@cds.odata.valuelist
entity Tasks : managed, cuid {
    title             : String                   @title : '{i18n>Tasks.title}';
    description       : String                   @title : '{i18n>Tasks.description}';
    dueDate           : Date                     @title : '{i18n>Tasks.due}';
    deliveryDate      : Date                     @title : '{i18n>Tasks.dueDate}';
    beginFrom         : Date                     @title : '{i18n>Tasks.beginFrom}';
    beginDate         : Date                     @title : '{i18n>Tasks.beginDate}';
    daysBetween       : Decimal(10, 2)           @Core.Computed;
    workload          : Decimal(10, 2)           @Core.Computed;
    estimate          : Decimal(10, 2)           @title : '{i18n>Tasks.estimate}';
    estimateMin       : Decimal(10, 2)           @title : '{i18n>Tasks.estimateMin}';
    estimateMax       : Decimal(10, 2)           @title : '{i18n>Tasks.estimateMax}';
    effort            : Decimal(10, 2)           @title : '{i18n>Tasks.effort}';
    priority          : Integer                  @title : '{i18n>Tasks.priority}';
    personResponsible : Association to Employees @title : '{i18n>Tasks.personResponsible}';
    project           : Association to Projects  @title : '{i18n>Tasks.project}';
};

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
        project             : Association to Projects                          @title : '{i18n>WorkItems.project}';
        projectName         : String                                           @title : '{i18n>WorkItems.projectName}';
        ticket              : String                                           @title : '{i18n>WorkItems.ticket}';
        type                : String                                           @title : '{i18n>WorkItems.type}';
        duration            : Decimal                                          @title : '{i18n>WorkItems.duration}'
};
