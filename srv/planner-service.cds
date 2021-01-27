using {iot.planner as my} from '../db/schema';

service PlannerService @(path : '/browse') {
    entity Employees as projection on my.Employees;
    entity Projects  as projection on my.Projects;
    entity Tasks     as projection on my.Tasks;
}
