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

entity Customers : managed, cuid {
    name     : String @title : '{i18n>Customers.name}';
    projects : Association to many Projects
                   on projects.customer = $self;
}

entity Projects : managed, cuid {
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
    key ID               : String                  @title : '{i18n>WorkItems.ID}';
    key activatedDate    : DateTime                @title : '{i18n>WorkItems.ActivatedDate}';
    key completedDate    : DateTime                @title : '{i18n>WorkItems.CompletedDate}';
        assignedTo       : Association to Users    @title : '{i18n>WorkItems.AssignedTo}';
        changedDate      : DateTime                @title : '{i18n>WorkItems.ChangedDate}';
        assignedToName   : String                  @title : '{i18n>WorkItems.AssignedToName}';
        createdDate      : DateTime                @title : '{i18n>WorkItems.CreatedDate}';
        reason           : String                  @title : '{i18n>WorkItems.Reason}';
        state            : String                  @title : '{i18n>WorkItems.State}';
        teamProject      : String                  @title : '{i18n>WorkItems.TeamProject}';
        title            : String                  @title : '{i18n>WorkItems.Title}';
        workItemType     : String                  @title : '{i18n>WorkItems.WorkItemType}';
        // Scheduling
        completedWork    : Decimal                 @title : '{i18n>WorkItems.CompletedWork}';
        remainingWork    : Decimal                 @title : '{i18n>WorkItems.RemainingWork}';
        originalEstimate : Decimal                 @title : '{i18n>WorkItems.OriginalEstimate}';
        // Documentation
        resolvedDate     : DateTime                @title : '{i18n>WorkItems.ResolvedDate}';
        closedDate       : DateTime                @title : '{i18n>WorkItems.ClosedDate}';
        customer         : String                  @title : '{i18n>WorkItems.customer}';
        private          : Boolean                 @title : '{i18n>WorkItems.private}';
        type             : String                  @title : '{i18n>WorkItems.type}';
        project          : Association to Projects @title : '{i18n>WorkItems.project}';
        projectName      : String;
        ticket           : String;
};
