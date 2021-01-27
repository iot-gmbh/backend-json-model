using AdminService from '../../srv/admin-service';

annotate AdminService.Employees with @UI : {
    SelectionFields : [name, ],
    LineItem        : [{
        $Type : 'UI.DataField',
        Value : name,
    }, ]
}
                                     @odata.draft.enabled;
