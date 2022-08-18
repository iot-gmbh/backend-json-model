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
    key id,
        subject,
        start,
        end,
        sensitivity,
        categories,
        isAllDay
  }
};
