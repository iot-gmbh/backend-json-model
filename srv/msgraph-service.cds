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
        // cast(start as Date) as date,
        start          as activatedDate,
        // cast(start as Time) as activatedDateTime,
        end            as completedDate,
        // cast(end as   Time) as completedDateTime,
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
