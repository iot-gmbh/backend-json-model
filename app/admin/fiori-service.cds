using {AdminService as my} from '../../srv/admin-service';

annotate my.Employees;
annotate my.Projects;
annotate my.Tasks with @odata.draft.enabled;
