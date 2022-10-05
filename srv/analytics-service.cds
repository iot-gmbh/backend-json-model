using {WorkItemsService as my} from './work-items-service';


service AnalyticsService {
  @Aggregation.ApplySupported.PropertyRestrictions : true
  // // With this annotation the Fiori Application Generator also works
  // // with the CAP Project and shows the entity in the drop-down
  @Aggregation.ApplySupported                      : {
    Transformations        : [
      'aggregate',
      'groupby'
    ],
    AggregatableProperties : [{
      $Type    : 'Aggregation.AggregatablePropertyType',
      Property : duration,
    }, ],
  }
  @Aggregation                                     : {RecursiveHierarchy : {
    $Type                    : 'Aggregation.RecursiveHierarchyType',
    NodeProperty             : ID,
    ParentNavigationProperty : parent,
    DistanceFromRootProperty : hierarchyLevel,
    IsLeafProperty           : drillDownState,
  }, }
  @(Analytics.AggregatedProperties : [{
    Name                 : 'totalDuration',
    AggregationMethod    : 'sum',
    AggregatableProperty : 'duration',
    $Type                : 'Analytics.AggregatedPropertyType',
    ![@Common.Label]     : 'Total duration'
  }])
  entity WorkItems as
    select from my.WorkItems {
      @Analytics.Dimension           : true
      ID,
      @Analytics.Dimension           : true
      assignedToUserPrincipalName,

      @Analytics.Dimension           : true
      TO_CHAR(
        activatedDate, 'dd.mm.yyyy') as date           : String,

      @Analytics.Dimension           : true
      activatedDate,
      @Analytics.Dimension           : true
      completedDate,
      @Analytics.Dimension           : true
      activatedDateMonth,
      @Analytics.Dimension           : true
      activatedDateYear,
      @Analytics.Dimension           : true
      parent.title                   as category,

      @Analytics.Dimension           : true
      hierarchy.level0Title,
      @Analytics.Dimension           : true
      hierarchy.level1Title,
      @Analytics.Dimension           : true
      hierarchy.level2Title,
      @Analytics.Dimension           : true
      hierarchy.level3Title,

      @Analytics.Measure             : true
      @Aggregation.default           : #SUM
      duration,

      // @Analytics.Dimension           : true
      // ''                             as parent         : UUID,
      @Analytics.Dimension           : true
      assignedTo,

      @sap.hierarchy.drill.state.for : 'ID'
      'expanded'                     as drillDownState : String,
      ''                             as hierarchyLevel : String,
      tenant,
      parent
    }
    where
      deleted is null;

  entity Users     as projection on my.Users;
}
