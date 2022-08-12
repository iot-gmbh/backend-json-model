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
  entity Categories as
    select from my.Categories as cat
    left outer join my.WorkItems as wi
      on wi.parent.ID = cat.ID
    {
      @Analytics.Dimension           : true
      cat.ID,
      @Analytics.Dimension           : true
      assignedToUserPrincipalName,
      @Analytics.Dimension           : true
      activatedDate,
      @Analytics.Dimension           : true
      completedDate,
      @Analytics.Dimension           : true
      activatedDateMonth,
      @Analytics.Dimension           : true
      activatedDateYear,

      @Analytics.Measure             : true
      @Aggregation.default           : #SUM
      wi.duration,

      @Analytics.Dimension           : true
      cat.title  as parentTitle,
      @Analytics.Dimension           : true
      cat.parent,
      @Analytics.Dimension           : true
      assignedTo,

      @sap.hierarchy.drill.state.for : 'ID'
      'expanded' as drillDownState : String,
      cat.hierarchyLevel,
      cat.tenant,
    }
    where
      deleted is null;

  entity Users      as projection on my.Users;
// entity Categories as projection on my.Categories;
}
