using {microsoft.graph as msgraph} from './external/msgraph';

service MSGraphService @(requires : 'authenticated-user') {
  entity Users  as projection on msgraph.users {
    key userPrincipalName,
        givenName,
        jobTitle,
        mail,
        mobilePhone,
        officeLocation,
        displayName,
        city,
        companyName,
        surname,
        usageLocation,
        userType,
        preferredLanguage,
  }

  entity Events as projection on msgraph.events {
    key id      as ID,
        subject as title,
        start                : DateTime,
        end                  : DateTime,
        sensitivity,
        case
          when
            sensitivity = 'private'
          then
            true
          else
            false
        end     as isPrivate : Boolean,
        categories,
        isAllDay,
  }
};
