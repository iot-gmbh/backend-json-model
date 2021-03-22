service MSGraphService {
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
        ID       : String;
        subject  : String;
        start    : DateTime;
        end      : DateTime;
        customer : String;
        private  : Boolean;
    }
};
