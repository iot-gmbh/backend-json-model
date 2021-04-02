using {iot.planner as my} from '../db/schema';

service PlannerService @(path : '/browse') {
    entity Employees as projection on my.Users;
    entity Projects  as projection on my.Projects;
}
