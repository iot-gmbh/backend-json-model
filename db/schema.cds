using {
  Currency,
  cuid,
  managed,
  sap
} from '@sap/cds/common';

using {iot.planner.hierarchies.Hierarchies as Hierarchies} from './hierarchies';


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
      categories        : Association to many Users2Categories
                            on categories.user = $self;
      teamMembers       : Association to many Users
                            on teamMembers.manager = $self;
      workItems         : Association to many WorkItems
                            on workItems.assignedTo = $self;
      travels           : Association to many Travels
                            on travels.user = $self;
};

entity Users2Categories : cuid, managed {
  user     : Association to Users;
  category : Association to Categories;
}

entity Categories : cuid, managed, relevance {
  title          : String;
  description    : String;
  hierarchyLevel : Integer;
  friendlyID     : String;
  mappingID      : String;
  drillDownState : String default 'expanded';
  path           : String;
  levelName      : Association to CategoryLevels
                     on hierarchyLevel = levelName.hierarchyLevel;
  manager        : Association to Users;
  members        : Association to many Users2Categories
                     on members.category = $self;
  parent         : Association to Categories;
  children       : Association to many Categories
                     on children.parent = $self;
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
      customerName        : String;
      private             : Boolean;
      isAllDay            : Boolean;
      // Custom
      project_friendlyID  : String;
      projectTitle        : String;
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
      hierarchy           : Association to Hierarchies;
};

entity CategoryLevels {
  key hierarchyLevel : Integer;
      title          : String;
}

entity Travels : cuid, managed {
  user : Association to Users;
}
