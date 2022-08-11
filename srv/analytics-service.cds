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
  // @Aggregation                : {RecursiveHierarchy : {
  //   $Type                    : 'Aggregation.RecursiveHierarchyType',
  //   NodeProperty             : ID,
  //   ParentNavigationProperty : parent,
  // }, }
  @(Analytics.AggregatedProperties : [{
    Name                 : 'totalDuration',
    AggregationMethod    : 'sum',
    AggregatableProperty : 'duration',
    $Type                : 'Analytics.AggregatedPropertyType',
    ![@Common.Label]     : 'Total duration'
  }])
  entity WorkItems
                    // @(restrict : [
                    //   {
                    //     grant : 'READ',
                    //     to    : 'team-lead',
                    //     // Association paths are currently supported on SAP HANA only
                    //     // https://cap.cloud.sap/docs/guides/authorization#association-paths
                    //     where : 'assignedTo.manager_userPrincipalName = $user'
                    //   },
                    //   {
                    //     grant : 'READ',
                    //     to    : 'authenticated-user',
                    //     where : 'assignedTo_userPrincipalName = $user'
                    //   },
                    //   {
                    //     grant : 'READ',
                    //     to    : 'admin',
                    //   },
                    // ])
                    as projection on my.WorkItems {
    @Analytics.Dimension : true
    assignedToUserPrincipalName,
    @Analytics.Dimension : true
    activatedDate,
    @Analytics.Dimension : true
    completedDate,
    @Analytics.Dimension : true
    activatedDateMonth,
    @Analytics.Dimension : true
    activatedDateYear,

    @Analytics.Measure   : true
    @Aggregation.default : #SUM
    round(
      duration, 2) as duration : Decimal(9, 2) @(title : '{i18n>WorkItemsAggr.duration}'),

    @Analytics.Dimension : true
    parent.title   as parentTitle,
    @Analytics.Dimension : true
    parent,
    @Analytics.Dimension : true
    assignedTo,
  } where deleted is null;

  entity Users      as projection on my.Users;
  entity Categories as projection on my.Categories;
}
