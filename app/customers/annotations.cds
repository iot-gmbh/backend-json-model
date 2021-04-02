using AdminService as my from '../../srv/admin-service';


annotate my.Customers with @odata.draft.enabled {
    friendlyID @mandatory : true
}
