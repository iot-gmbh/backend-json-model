using {
    Currency,
    managed,
    cuid,
    sap
} from '@sap/cds/common';

namespace iot.planner;

entity Employees : managed, cuid {
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
