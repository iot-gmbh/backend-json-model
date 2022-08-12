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

aspect multitenant {
  tenant : String
}

@assert.unique : {friendlyID : [userPrincipalName, ]}
entity Users : multitenant {
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

entity Users2Categories : cuid, managed, multitenant {
  user     : Association to Users;
  category : Association to Categories;
}

entity Categories : cuid, managed, relevance, multitenant {
  title           : String;
  description     : String;
  reference       : String;
  mappingID       : String;
  drillDownState  : String default 'expanded';
  path            : String;
  hierarchyLevel  : String;
  levelSpecificID : String;
  catNumber       : String;
  totalDuration   : Decimal;
  level           : Association to CategoryLevels
                      on hierarchyLevel = level.hierarchyLevel;
  tags            : Association to many Tags2Categories
                      on tags.category = $self;
  @assert.notNull : false
  manager         : Association to Users;
  members         : Association to many Users2Categories
                      on members.category = $self;
  @assert.notNull : false
  parent          : Association to Categories;
  children        : Association to many Categories
                      on children.parent = $self;
}

entity CategoriesCumulativeDurations as projection on Categories {
  key ID,
      tenant,
      title,
      parent,
      // members,
      // tags,
      children,
      // levelSpecificID as catNumber,
      // title           as path,
      totalDuration
}

entity Tags : multitenant {
  key title    : String;
      category : Association to Categories;
      workItem : Association to WorkItems;
}

entity Tags2Categories : cuid, multitenant {
  tag      : Association to Tags;
  category : Association to Categories;
}

entity Tags2WorkItems : cuid, multitenant {
  tag      : Association to Tags;
  workItem : Association to WorkItems;
}

view CategoryTags as
  select from Tags2Categories {
    key category.ID       as categoryID : String,
        tenant                          : String,
        // TODO: Make independent of DB (string_agg) is a postgres-function
        string_agg(
          tag.title, ' ') as tags       : String,
    }
    group by
      category.ID,
      tenant;

entity WorkItems : managed, relevance, multitenant {
  key ID                 : String @odata.Type : 'Edm.String';
      tags               : Composition of many Tags2WorkItems
                             on tags.workItem = $self;
      activatedDate      : DateTime;
      activatedDateMonth : Integer;
      activatedDateYear  : Integer;
      activatedDateDay   : Integer;
      completedDate      : DateTime;
      completedDateMonth : Integer;
      completedDateYear  : Integer;
      completedDateDay   : Integer;
      assignedTo         : Association to Users;
      changedDate        : DateTime;
      assignedToName     : String;
      createdDate        : DateTime;
      reason             : String;
      state              : String;
      teamProject        : String;
      title              : String;
      workItemType       : String;
      // Scheduling
      completedWork      : Decimal;
      remainingWork      : Decimal;
      originalEstimate   : Decimal;
      // Documentation
      resolvedDate       : DateTime;
      closedDate         : DateTime;
      private            : Boolean;
      isAllDay           : Boolean;
      // Custom
      type               : String enum {
        Manual;
        Event;
        WorkItem
      };
      duration           : Decimal;
      resetEntry         : Boolean;
      deleted            : Boolean;
      confirmed          : Boolean;
      parent             : Association to Categories;
      hierarchy          : Association to Hierarchies
                             on parent.ID = hierarchy.ID;
      // Used by the Frontend's hierarchy input-filter
      parentPath         : String;
};

entity CategoryLevels : multitenant {
  key hierarchyLevel : String;
      title          : String;
}

entity Travels : cuid, managed, multitenant {
  user   : Association to Users;
  parent : Association to Categories;
}
