using {iot.planner as my} from '../db/schema';
using {iot.planner.hierarchies as hierarchies} from '../db/hierarchies';

service AnalyticsService {
  @Aggregation.ApplySupported.PropertyRestrictions : true
  // // With this annotation the Fiori Application Generator also works
  // // with the CAP Project and shows the entity in the drop-down
  @Aggregation.ApplySupported                      : {
    Transformations        : [
      'aggregate',
      'groupby'
    ],
    GroupableProperties    : [],
    AggregatableProperties : [{
      $Type    : 'Aggregation.AggregatablePropertyType',
      Property : duration,
    }, ],
  }
  // @Aggregation                                     : {RecursiveHierarchy : {
  //   $Type                    : 'Aggregation.RecursiveHierarchyType',
  //   NodeProperty             : ID,
  //   ParentNavigationProperty : parent,
  //   DistanceFromRootProperty : hierarchyLevel,
  //   IsLeafProperty           : drillDownState,
  // }, }
  @(Analytics.AggregatedProperties : [{
    Name                 : 'totalDuration',
    AggregationMethod    : 'sum',
    AggregatableProperty : 'duration',
    $Type                : 'Analytics.AggregatedPropertyType',
    ![@Common.Label]     : '{i18n>WorkItems.totalDuration}'
  }])
  @(restrict : [
    {
      grant : 'READ',
      to    : 'team-lead',
      // Association paths are currently supported on SAP HANA only
      // https://cap.cloud.sap/docs/guides/authorization#association-paths
      where : 'managerUserPrincipalName = $user'
    },
    {
      grant : 'READ',
      to    : 'authenticated-user',
      where : 'assignedToUserPrincipalName = $user'
    },
    {
      grant : 'READ',
      to    : 'admin',
    },
  ])
  entity WorkItems        as projection on my.WorkItems {
        @Analytics.Dimension           : true
    key ID,
        @Analytics.Dimension           : true
        assignedTo.userPrincipalName         as assignedToUserPrincipalName,
        @Analytics.Dimension           : true
        assignedTo.manager.userPrincipalName as managerUserPrincipalName,
        @Analytics.Dimension           : true
        assignedTo.userPrincipalName,

        @Analytics.Dimension           : true
        TO_CHAR(
          activatedDate, 'dd.mm.yyyy'
        )                                    as date           : String,

        @Analytics.Dimension           : true
        activatedDate,
        @Analytics.Dimension           : true
        completedDate,
        @Analytics.Dimension           : true
        activatedDateMonth,
        @Analytics.Dimension           : true
        activatedDateYear,
        @Analytics.Dimension           : true
        parent.title                         as category,

        @Analytics.Dimension           : true
        hierarchy.level0,
        @Analytics.Dimension           : true
        hierarchy.level1,
        @Analytics.Dimension           : true
        hierarchy.level2,
        @Analytics.Dimension           : true
        hierarchy.level3,

        hierarchy.level0Title,
        hierarchy.level1Title,
        hierarchy.level2Title,
        hierarchy.level3Title,

        @Analytics.Measure             : true
        @Aggregation.default           : #SUM
        duration,

        // @Analytics.Dimension           : true
        // parent,
        @Analytics.Dimension           : true
        assignedTo,

        @sap.hierarchy.drill.state.for : 'ID'
        'expanded'                           as drillDownState : String,
        ''                                   as hierarchyLevel : String,
        tenant,
        parent
  } where deleted is null;

  entity Users            as projection on my.Users;

  @cds.redirection.target
  entity Categories       as projection on my.Categories;

  entity CategoriesLevel0 as projection on my.Categories where hierarchyLevel = '0';

  entity CategoriesLevel1 as projection on my.Categories {
    *,
    parent.ID    as level0,
    parent.title as level0Title,
  } where hierarchyLevel = '1';

  entity CategoriesLevel2 as projection on my.Categories {
    *,
    parent.ID        as level1,
    parent.parent.ID as level0,
    parent.title        as level1Title,
    parent.parent.title as level0Title,
  } where hierarchyLevel = '2';

  entity CategoriesLevel3 as projection on my.Categories {
    *,
    parent.ID                  as level2,
    parent.parent.ID           as level1,
    parent.parent.parent.ID    as level0,
    parent.title               as level2Title,
    parent.parent.title        as level1Title,
    parent.parent.parent.title as level0Title,
  } where hierarchyLevel = '3';
}
