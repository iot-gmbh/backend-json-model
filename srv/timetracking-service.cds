using {iot.planner as my} from '../db/schema';
using {AzureDevopsService as AzDevOps} from './azure-devops';
using {MSGraphService as MSGraph} from './msgraph-service';

service TimetrackingService @(requires : 'authenticated-user') {
    entity MyWorkItems @(restrict : [
        {
            grant : 'READ',
            where : 'assignedTo_userPrincipalName = $user'
        },
        {
            grant : 'WRITE',
            to    : 'authenticated-user'
        }
    ])                    as projection on my.WorkItems;

    entity Customers      as projection on my.Customers;
    entity Projects       as projection on my.Projects;
    entity Users2Projects as projection on my.Users2Projects;
}
