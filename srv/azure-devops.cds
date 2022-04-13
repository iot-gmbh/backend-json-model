using {iot.planner as my} from '../db/schema';

service AzureDevopsService @(requires : 'authenticated-user') {
    entity WorkItems as projection on my.WorkItems;
    entity Packages  as projection on my.PackagesDB;

// entity Users     as projection on my.Users {
//     * , workItems : redirected to WorkItems
// };
};
