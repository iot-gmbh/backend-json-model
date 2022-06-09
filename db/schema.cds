using {
  Currency,
  cuid,
  managed,
  sap
} from '@sap/cds/common';

namespace iot.planner;

aspect relevance {
  invoiceRelevance : Decimal(2, 1) @(
    title        : '{i18n>invoiceRelevance}',
    assert.range : [
      0,
      1
    ],
  );
  bonusRelevance   : Decimal(2, 1) @(
    title        : '{i18n>bonusRelevance}',
    assert.range : [
      0,
      1
    ],
  );
};

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
      travels           : Association to many Travels
                            on travels.user = $self;
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
entity Customers : cuid, managed, relevance {
  friendlyID : String @mandatory;
  name       : String;
  projects   : Association to many Projects
                 on projects.customer = $self;
}

@assert.unique : {friendlyID : [
  customer_friendlyID,
  friendlyID
]}
entity Projects : cuid, managed, relevance {
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

entity Packages : cuid, managed, relevance {
  project      : Association to Projects;
  workItems    : Association to many WorkItems
                   on workItems.workPackage = $self;
  title        : String;
  IOTPackageID : String;
  description  : String;
}

entity WorkItems : managed, relevance {
  key ID                  : String @odata.Type : 'Edm.String';
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
      completedWork       : Decimal(2);
      remainingWork       : Decimal(2);
      originalEstimate    : Decimal(2);
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
      duration            : Decimal(2);
      resetEntry          : Boolean;
      deleted             : Boolean;
      confirmed           : Boolean;
};

entity Travels : cuid, managed {
  customer : Association to Customers;
  user     : Association to Users;
}
