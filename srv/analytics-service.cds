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
    GroupableProperties    : [level0Title],
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
    ![@Common.Label]     : 'Total duration'
  }])
  entity WorkItems   as
    select from my.WorkItems {
          @Analytics.Dimension           : true
      key ID,
          @Analytics.Dimension           : true
          assignedToUserPrincipalName,

          @Analytics.Dimension           : true
          TO_CHAR(
            activatedDate, 'dd.mm.yyyy'
          )            as date           : String,

          @Analytics.Dimension           : true
          activatedDate,
          @Analytics.Dimension           : true
          completedDate,
          @Analytics.Dimension           : true
          activatedDateMonth,
          @Analytics.Dimension           : true
          activatedDateYear,
          @Analytics.Dimension           : true
          parent.title as category,

          @title                         : 'Customer'
          @Analytics.Dimension           : true
          hierarchy.level0Title,
          @title                         : 'Project'
          @Analytics.Dimension           : true
          hierarchy.level1Title,
          @title                         : 'SubProject'
          @Analytics.Dimension           : true
          hierarchy.level2Title,
          @title                         : 'Package'
          @Analytics.Dimension           : true
          hierarchy.level3Title,

          @Analytics.Measure             : true
          @Aggregation.default           : #SUM
          duration,

          // @Analytics.Dimension           : true
          // parent,
          @Analytics.Dimension           : true
          assignedTo,

          @sap.hierarchy.drill.state.for : 'ID'
          'expanded'   as drillDownState : String,
          ''           as hierarchyLevel : String,
          tenant,
          parent
    }
    where
      deleted is null;

  entity Users       as projection on my.Users;

  @cds.redirection.target
  entity Categories  as projection on my.Categories;

  entity Customers   as projection on my.Categories where hierarchyLevel = '0';

  entity Projects    as projection on my.Categories {
    *,
    parent.title as customerTitle
  } where hierarchyLevel = '1';

  entity SubProjects as projection on my.Categories {
    *,
    parent.title        as projectTitle,
    parent.parent.title as customerTitle
  } where hierarchyLevel = '2';

  entity Packages    as projection on my.Categories {
    *,
    parent.title               as subProjectTitle,
    parent.parent.title        as projectTitle,
    parent.parent.parent.title as customerTitle
  } where hierarchyLevel = '3';
}
