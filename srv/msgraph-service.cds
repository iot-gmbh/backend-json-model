using {microsoft.graph as msgraph} from './external/msgraph';

service MSGraphService @(requires : 'authenticated-user') {
  entity Users     as projection on msgraph.users {
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

  function getWorkItemByID(ID : String)                                      returns WorkItems;
  function getCalendarView(startDateTime : DateTime, endDateTime : DateTime) returns array of WorkItems;

  entity WorkItems as projection on msgraph.events {
        @odata.Type : 'Edm.String'
    key id             as ID,
        subject        as title,
        start          as activatedDate,
        end            as completedDate,
        location,
        sensitivity,
        case
          when
            sensitivity = 'private'
          then
            true
          else
            false
        end            as isPrivate : Boolean,
        categories     as tags,
        'MSGraphEvent' as source    : String,
        isAllDay,
  }
};
