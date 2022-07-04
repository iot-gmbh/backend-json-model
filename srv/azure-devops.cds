using {iot.planner as my} from '../db/schema';

service AzureDevopsService @(requires : 'authenticated-user') {
  entity WorkItems as projection on my.WorkItems;
};
