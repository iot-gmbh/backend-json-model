using {
  Currency,
  cuid,
  managed,
  sap
} from '@sap/cds/common';

namespace iot.planner;

using {iot.planner.hierarchies.Hierarchies as Hierarchies} from './hierarchies';

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
  tags           : Association to many Tags2Categories
                     on tags.category = $self;
  levelName      : Association to CategoryLevels
                     on hierarchyLevel = levelName.hierarchyLevel;
  manager        : Association to Users;
  members        : Association to many Users2Categories
                     on members.category = $self;
  parent         : Association to Categories;
  children       : Association to many Categories
                     on children.parent = $self;
}

entity Tags {
  key title    : String;
      category : Association to Categories;
      workItem : Association to WorkItems;
}

entity Tags2Categories : cuid {
  tag      : Association to Tags;
  category : Association to Categories;
}

entity Tags2WorkItems : cuid {
  tag      : Association to Tags;
  workItem : Association to WorkItems;
}

view MatchCategory2WorkItem as
  select from Tags2WorkItems as t2w
  join Tags2Categories as t2c
    on t2w.tag = t2c.tag
  {
    key workItem.ID as workitemID       : String,
        category.ID as categoryID       : String,
        rank(
          ) over(
          partition by category.ID order by
            count(
              *
            ) desc
        )           as noOfMatchingTags : Integer
  }
  group by
    category.ID,
    workItem.ID;

entity WorkItems : managed, relevance {
  key ID                  : String @odata.Type : 'Edm.String';
      tags                : Composition of many Tags2WorkItems
                              on tags.workItem = $self;
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
      parent              : Association to Categories;
      hierarchy           : Association to Hierarchies
                              on parent.ID = hierarchy.parent;
      // Used by the Frontend's hierarchy input-filter
      parentPath          : String;
};

entity CategoryLevels {
  key hierarchyLevel : Integer;
      title          : localized String;
}

entity Travels : cuid, managed {
  user   : Association to Users;
  parent : Association to Categories;
}
