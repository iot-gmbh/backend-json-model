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
    due               : Date                     @title : '{i18n>Tasks.due}';
    begin             : Date                     @title : '{i18n>Tasks.begin}';
    estimate          : Integer                  @title : '{i18n>Tasks.estimate}';
    effort            : Integer                  @title : '{i18n>Tasks.effort}';
    personResponsible : Association to Employees @title : '{i18n>Tasks.personResponsible}';
    project           : Association to Projects  @title : '{i18n>Tasks.project}';
};
