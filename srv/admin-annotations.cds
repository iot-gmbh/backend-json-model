using {AdminService as my} from './admin-service';

annotate my.ProjectsPerUser with @(UI : {LineItem : [{
    $Type : 'UI.DataField',
    Value : project_ID,
}]}) {
    ID @UI.Hidden;
};

annotate my.UsersPerProject with @(UI : {LineItem : [{
    $Type : 'UI.DataField',
    Value : user_userPrincipalName,
}]}) {
    ID @UI.Hidden;
};
