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
    @Aggregation.ApplySupported : {
        $Type                  : 'Aggregation.ApplySupportedType',
        AggregatableProperties : [{
            $Type    : 'Aggregation.AggregatablePropertyType',
            Property : originalEstimate,
        }, ],
    }
    entity WorkItemStatistics as projection on my.WorkItems {
        ID,
        @Analytics.AccumulativeMeasure
        originalEstimate,
        @Analytics.AccumulativeMeasure
        duration,
        @Analytics.Dimension
        completedDate,
        @Analytics.Dimension
        assignedTo,
        @Analytics.Dimension
        customer,
        @Analytics.Dimension
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
