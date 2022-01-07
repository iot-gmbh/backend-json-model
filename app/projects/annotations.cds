using AdminService as my from '../../srv/admin-service';

annotate my.Users2Projects with @(UI : {
    Identification  : [{Value : user_userPrincipalName}, ],
    SelectionFields : [user_userPrincipalName, ],
    LineItem        : [{
        $Type : 'UI.DataField',
        Value : user_userPrincipalName,
    }, ]
}) {
    ID @UI.Hidden;
// user_userPrincipalName @(Common : {
//     Text         : {
//         $value                 : user.displayName,
//         ![@UI.TextArrangement] : #TextOnly
//     },
//     FieldControl : #Mandatory
// });
};
