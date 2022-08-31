@cds.persistence.skip : true
entity microsoft.graph.events : microsoft.graph.outlookItem {
  allowNewTimeProposals      :      Boolean;
  attendees                  : many microsoft.graph.attendee;
  body                       :      microsoft.graph.itemBody;
  bodyPreview                :      LargeString;
  hasAttachments             :      Boolean;
  hideAttendees              :      Boolean;
  iCalUId                    :      LargeString;
  importance                 :      LargeString;
  isAllDay                   :      Boolean;
  isCancelled                :      Boolean;
  isDraft                    :      Boolean;
  isOnlineMeeting            :      Boolean;
  isOrganizer                :      Boolean;
  isReminderOn               :      Boolean;
  location                   :      microsoft.graph.location;
  locations                  : many microsoft.graph.location;
  onlineMeetingProvider      :      LargeString;
  onlineMeetingUrl           :      LargeString;
  organizer                  :      microsoft.graph.recipient;
  originalEndTimeZone        :      LargeString;
  @odata.precision : 0
  @odata.type      : 'Edm.DateTimeOffset'
  originalStart              :      DateTime;
  originalStartTimeZone      :      LargeString;
  recurrence                 :      microsoft.graph.patternedRecurrence;
  reminderMinutesBeforeStart :      Integer;
  responseRequested          :      Boolean;
  sensitivity                :      LargeString;
  seriesMasterId             :      LargeString;
  showAs                     :      LargeString;
  end                        :      LargeString;
  // end                        :      Association to microsoft.graph.dateTimeTimeZone;
  enddatetime                :      LargeString;
  // startDeep                  :      Association to test;
  start                      :      LargeString;
  // start                      :      Association to microsoft.graph.dateTimeTimeZone;
  startdatetime              :      LargeString;
  subject                    :      LargeString;
  transactionId              :      LargeString;
  type                       :      LargeString;
  webLink                    :      LargeString;
} actions {
  action cancel(Comment : LargeString);
};

@cds.autoexpose
entity microsoft.graph.dateTimeTimeZone {
  key ID       : String;
      dateTime : LargeString;
      timeZone : LargeString;
}

@cds.persistence.skip : true
entity microsoft.graph.entity {
  key id : LargeString;
};

@cds.persistence.skip : true
entity microsoft.graph.outlookItem : microsoft.graph.entity {
  categories           : many LargeString;
  changeKey            :      LargeString;
  @odata.precision : 0
  @odata.type      : 'Edm.DateTimeOffset'
  createdDateTime      :      DateTime;
  @odata.precision : 0
  @odata.type      : 'Edm.DateTimeOffset'
  lastModifiedDateTime :      DateTime;
};

type microsoft.graph.itemBody {
  content : LargeString;
};

type microsoft.graph.emailAddress {
  address : LargeString;
  name    : LargeString;
};

type microsoft.graph.recipient {
  emailAddress : microsoft.graph.emailAddress;
};

type microsoft.graph.attendee : microsoft.graph.recipient;

type microsoft.graph.physicalAddress {
  city            : LargeString;
  countryOrRegion : LargeString;
  postalCode      : LargeString;
  state           : LargeString;
  street          : LargeString;
};

type microsoft.graph.outlookGeoCoordinates {
  accuracy         : Double;
  altitude         : Double;
  altitudeAccuracy : Double;
  latitude         : Double;
  longitude        : Double;
};

type microsoft.graph.location {
  address              : microsoft.graph.physicalAddress;
  coordinates          : microsoft.graph.outlookGeoCoordinates;
  displayName          : LargeString;
  locationEmailAddress : LargeString;
  locationUri          : LargeString;
  uniqueId             : LargeString;
};

type microsoft.graph.patternedRecurrence {
  pattern : microsoft.graph.recurrencePattern;
  range   : microsoft.graph.recurrenceRange;
};

type microsoft.graph.recurrencePattern {
  dayOfMonth : Integer;
  interval   : Integer;
  month      : Integer;
};

type microsoft.graph.recurrenceRange {
  endDate             : Date;
  numberOfOccurrences : Integer;
  recurrenceTimeZone  : LargeString;
  startDate           : Date;
};

@cds.persistence.skip : true
entity microsoft.graph.directoryObjects : microsoft.graph.entity {
  @odata.precision : 0
  @odata.type      : 'Edm.DateTimeOffset'
  deletedDateTime : DateTime;
};

@cds.persistence.skip : true
entity microsoft.graph.users : microsoft.graph.directoryObjects {
  id                : LargeString;
  givenName         : LargeString;
  jobTitle          : LargeString;
  mail              : LargeString;
  mobilePhone       : LargeString;
  officeLocation    : LargeString;
  displayName       : LargeString;
  city              : LargeString;
  companyName       : LargeString;
  surname           : LargeString;
  usageLocation     : LargeString;
  userPrincipalName : LargeString;
  userType          : LargeString;
  preferredLanguage : LargeString;
};

@cds.external : true
service microsoft.graph {
  entity Events as projection on microsoft.graph.events;
  entity Users  as projection on microsoft.graph.users;
};
