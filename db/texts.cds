using {iot.planner as my} from './schema';

annotate my.Users with {
  userPrincipalName @title : '{i18n>Users.principalName}';
  displayName       @title : '{i18n>Users.displayName}';
  givenName         @title : '{i18n>Users.givenName}';
  jobTitle          @title : '{i18n>Users.jobTitle}';
  mail              @title : '{i18n>Users.mail}';
  mobilePhone       @title : '{i18n>Users.mobilePhone}';
  officeLocation    @title : '{i18n>Users.officeLocation}';
  preferredLanguage @title : '{i18n>Users.preferredLanguage}';
  surname           @title : '{i18n>Users.surname}';
  manager           @title : '{i18n>Users.manager}';
  projects          @title : '{i18n>Users.projects}';
  managedProjects   @title : '{i18n>Users.managedProjects}';
  teamMembers       @title : '{i18n>Users.teamMembers}';
  workItems         @title : '{i18n>Users.workItems}';
};

annotate my.Users2Projects {
  user    @title : '{i18n>Users2Projects.user}';
  project @title : '{i18n>Users2Projects.project}';
};

annotate my.Customers {
  friendlyID        @title : '{i18n>Customers.friendlyID}';
  name              @title : '{i18n>Customers.name}';
  invoiceRelevance  @title : '{i18n>Customers.invoiceRelevance}';
  bonusRelevance    @title : '{i18n>Customers.bonusRelevance}';
  projects          @title : '{i18n>Customers.projects}';
}

annotate my.Packages {
  title                  @title : '{i18n>Packages.title}';
  description            @title : '{i18n>Packages.description}';
  invoiceRelevance       @title : '{i18n>Packages.invoiceRelevance}';
  bonusRelevance         @title : '{i18n>Packages.bonusRelevance}';
  IOTPackageID           @title : '{i18n>Packages.IOTPackageID}';
}

annotate my.Projects {
  friendlyID             @title : '{i18n>Projects.friendlyID}';
  title                  @title : '{i18n>Projects.title}';
  description            @title : '{i18n>Projects.description}';
  invoiceRelevance       @title : '{i18n>Projects.invoiceRelevance}';
  bonusRelevance         @title : '{i18n>Projects.bonusRelevance}';
  IOTProjectID           @title : '{i18n>Projects.IOTProjectID}';
  manager                @title : '{i18n>Projects.manager}';
  customer_friendlyID    @title : '{i18n>Projects.customerFriendlyID}';
  customer               @title : '{i18n>Projects.customer}';
  workPackages           @title : '{i18n>Projects.workPackages}';
  teamMembers            @title : '{i18n>Projects.teamMembers}';
  workItems              @title : '{i18n>Projects.workItems}';
}

annotate my.WorkItems {
  ID                           @title : '{i18n>WorkItems.ID}';
  activatedDate                @title : '{i18n>WorkItems.activatedDate}';
  activatedDateMonth           @title : '{i18n>WorkItems.activatedDateMonth}';
  activatedDateYear            @title : '{i18n>WorkItems.activatedDateYear}';
  activatedDateDay             @title : '{i18n>WorkItems.activatedDateDay}';
  completedDate                @title : '{i18n>WorkItems.completedDate}';
  completedDateMonth           @title : '{i18n>WorkItems.completedDateMonth}';
  completedDateYear            @title : '{i18n>WorkItems.completedDateYear}';
  completedDateDay             @title : '{i18n>WorkItems.completedDateDay}';
  assignedTo_userPrincipalName @title : '{i18n>WorkItems.assignedTo}';
  assignedTo                   @title : '{i18n>WorkItems.assignedTo}';
  changedDate                  @title : '{i18n>WorkItems.changedDate}';
  assignedToName               @title : '{i18n>WorkItems.assignedToName}';
  createdDate                  @title : '{i18n>WorkItems.createdDate}';
  reason                       @title : '{i18n>WorkItems.reason}';
  state                        @title : '{i18n>WorkItems.state}';
  teamProject                  @title : '{i18n>WorkItems.teamProject}';
  title                        @title : '{i18n>WorkItems.title}';
  workItemType                 @title : '{i18n>WorkItems.workItemType}';
  // Scheduling
  completedWork                @title : '{i18n>WorkItems.completedWork}';
  remainingWork                @title : '{i18n>WorkItems.remainingWork}';
  originalEstimate             @title : '{i18n>WorkItems.originalEstimate}';
  // Documentation
  resolvedDate                 @title : '{i18n>WorkItems.resolvedDate}';
  closedDate                   @title : '{i18n>WorkItems.closedDate}';
  customer_friendlyID          @title : '{i18n>WorkItems.customer}';
  customer                     @title : '{i18n>WorkItems.customer}';
  customerName                 @title : '{i18n>WorkItems.customerName}';
  private                      @title : '{i18n>WorkItems.private}';
  invoiceRelevance             @title : '{i18n>WorkItems.invoiceRelevance}';
  bonusRelevance               @title : '{i18n>WorkItems.bonusRelevance}';
  // Custom
  project_friendlyID           @title : '{i18n>WorkItems.project}';
  project                      @title : '{i18n>WorkItems.project}';
  projectTitle                 @title : '{i18n>WorkItems.projectTitle}';
  workPackage                  @title : '{i18n>WorkItems.workPackage}';
  ticket                       @title : '{i18n>WorkItems.ticket}';
  type                         @title : '{i18n>WorkItems.type}';
  duration                     @title : '{i18n>WorkItems.duration}';
  resetEntry                   @title : '{i18n>WorkItems.resetEntry}';
  deleted                      @title : '{i18n>WorkItems.deleted}';
  confirmed                    @title : '{i18n>WorkItems.confirmed}';
};
