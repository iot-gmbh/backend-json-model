using {WorkItemsService as my} from './work-items-service';


service AnalyticsService {
  @Aggregation.ApplySupported.PropertyRestrictions : true
  entity WorkItems                                         @(restrict : [
    {
      grant : 'READ',
      to    : 'team-lead',
      // Association paths are currently supported on SAP HANA only
      // https://cap.cloud.sap/docs/guides/authorization#association-paths
      where : 'assignedTo.manager_userPrincipalName = $user'
    },
    {
      grant : 'READ',
      to    : 'authenticated-user',
      where : 'assignedTo_userPrincipalName = $user'
    },
    {
      grant : 'READ',
      to    : 'admin',
    },
  ])                as projection on my.WorkItems {
    key ID,
        @Analytics.Dimension : true
        assignedTo.displayName as assignedToName           @(title : '{i18n>WorkItemsAggr.assignedTo}'),
        @Analytics.Dimension : true
        parent.title           as parentTitle              @(title : 'Parent'),
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
          duration, 2)         as duration : Decimal(9, 2) @(title : '{i18n>WorkItemsAggr.duration}'),
        @Analytics.Dimension : true
        parent,
        @Analytics.Dimension : true
        assignedTo,
  } where deleted is null;

  entity Users      as projection on my.Users;
  entity Categories as projection on my.Categories;
}
