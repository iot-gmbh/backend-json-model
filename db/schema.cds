using {
  Currency,
  cuid,
  managed,
  sap
} from '@sap/cds/common';

namespace iot.planner;

aspect relevance {
  invoiceRelevance : Decimal(2, 1) @(
    title        : '{i18n>relevance.invoiceRelevance}',
    assert.range : [
      0,
      1
    ],
  );
  bonusRelevance   : Decimal(2, 1) @(
    title        : '{i18n>relevance.bonusRelevance}',
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

entity Categories : cuid, managed, relevance {
  title          : String;
  description    : String;
  hierarchyLevel : Integer;
  friendlyID     : String;
  mappingID      : String;
  drillDownState : String default 'expanded';
  levelName      : Association to CategoryLevels
                     on hierarchyLevel = levelName.hierarchyLevel;
  manager        : Association to Users;
  members        : Association to many Users2Categories
                     on members.category = $self;
  parent         : Association to Categories;
  children       : Association to many Categories
                     on children.parent = $self;
}

entity CategoryLevels {
  key hierarchyLevel : Integer;
      title          : String;
}

entity Users2Categories : cuid, managed {
  user     : Association to Users;
  category : Association to Categories;
}

@assert.unique : {friendlyID : [
  user,
  project
]}
entity Users2Projects : cuid, managed {
  user    : Association to Users;
  project : Association to Projects;
};

view Hierarchies as
  select from WorkItems as item
  left outer join Categories as cat1
    on item.parent.ID = cat1.ID
  left outer join Categories as cat2
    on cat1.parent.ID = cat2.ID
  left outer join Categories as cat3
    on cat2.parent.ID = cat3.ID
  {
    key item.ID,
        cat1.title           as cat1,
        cat1.hierarchyLevel  as cat1Level,
        cat1.levelName.title as cat1LevelName,
        cat2.title           as cat2,
        cat2.hierarchyLevel  as cat2Level,
        cat2.levelName.title as cat2LevelName,
        cat3.title           as cat3,
        cat3.hierarchyLevel  as cat3Level,
        cat3.levelName.title as cat3LevelName
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
      isAllDay            : Boolean;
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
      parent              : Association to Categories;
      hierarchy           : Association to Hierarchies;
};

entity Travels : cuid, managed {
  customer : Association to Customers;
  user     : Association to Users;
}
