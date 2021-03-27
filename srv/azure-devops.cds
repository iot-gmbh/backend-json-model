using {iot.planner as my} from '../db/schema';

service AzureDevopsService @(requires : 'authenticated-user') {

    @(Analytics.AggregatedProperties : [
        {
            Name                 : 'totalEstimate',
            AggregationMethod    : 'sum',
            AggregatableProperty : 'originalEstimate',
            ![@Common.Label]     : 'Total Estimate'
        },
        {
            Name                 : 'totalDuration',
            AggregationMethod    : 'sum',
            AggregatableProperty : 'duration',
            ![@Common.Label]     : 'Total Duration'
        }
    ])
    @Aggregation.ApplySupported.PropertyRestrictions : true
    entity WorkItemStatistics as projection on my.WorkItems {
        key ID,
        @Analytics.AccumulativeMeasure : true
        originalEstimate,
        @Analytics.AccumulativeMeasure : true
        @Aggregation.default           : #SUM
        duration,
        @Analytics.Dimension           : true
        completedDate,
        @Analytics.Dimension           : true
        assignedTo,
        @Analytics.Dimension           : true
        customer,
        @Analytics.Dimension           : true
        project,
    }

    entity WorkItems          as projection on my.WorkItems;
    entity MyWorkItems        as projection on my.WorkItems;
    entity MyWork             as projection on my.WorkItems;

    entity Projects           as projection on my.Projects {
        * , workItems : redirected to MyWorkItems
    };

    entity Tasks              as projection on my.Tasks;

    entity Users              as projection on my.Users {
        * , workItems : redirected to MyWorkItems
    };

    entity Customers          as projection on my.Customers;
};
