service MSGraphService @(requires : 'authenticated-user') {
    entity Users {
        ID                : UUID; // It's a GUID that was casted to String
        displayName       : String;
        givenName         : String;
        jobTitle          : String;
        mail              : String;
        mobilePhone       : String;
        officeLocation    : String;
        preferredLanguage : String;
        surname           : String;
        userPrincipalName : String;
    };

    entity Events {
        ID        : String;
        subject   : String;
        startDate : DateTime;
        endDate   : DateTime;
        customer  : String;
        private   : Boolean;
    }
};
