using {iot.planner as my} from '../db/schema';

service AdminService @(_requires : 'authenticated-user') {
    entity Employees as projection on my.Employees;
    entity Customers as projection on my.Customers;
    entity Projects  as projection on my.Projects;
    entity Tasks     as projection on my.Tasks;
};
