using {iot.planner as my} from './schema';
using {iot.planner.hierarchies as hierarchies} from './hierarchies';

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
  yearlyVacDays     @title : '{i18n>Users.yearlyVacDays}';
  vacDaysTotal      @title : '{i18n>Users.vacDaysTotal}';
  vacDaysRemaining  @title : '{i18n>Users.vacDaysRemaining}';
  manager           @title : '{i18n>Users.manager}';
  projects          @title : '{i18n>Users.projects}';
  managedProjects   @title : '{i18n>Users.managedProjects}';
  teamMembers       @title : '{i18n>Users.teamMembers}';
  workItems         @title : '{i18n>Users.workItems}';
};

annotate my.Categories {
  title             @title : '{i18n>Categories.title}';
  description       @title : '{i18n>Categories.description}';
  parent            @title : '{i18n>Categories.parent}';
  children          @title : '{i18n>Categories.children}';
  path              @title : '{i18n>Categories.path}';
  validFrom         @title : '{i18n>Categories.validFrom}';
  validTo           @title : '{i18n>Categories.validTo}';
  absoluteReference @title : '{i18n>Categories.absoluteReference}';
  deepReference     @title : '{i18n>Categories.deepReference}';
};

annotate my.Vacations {
  ID                     @title : '{i18n>Vacations.id}';
  startDate              @title : '{i18n>Vacations.startDate}';
  endDate                @title : '{i18n>Vacations.endDate}';
  durationInDays         @title : '{i18n>Vacations.durationInDays}';
  user                   @title : '{i18n>Vacations.user}';
  user_userPrincipalName @title : '{i18n>Vacations.user}'
};

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

annotate hierarchies.WorkItems with {
  level0      @title : '{i18n>level0}';
  level0Title @title : '{i18n>level0Title}';
  level0Alias @title : '{i18n>level0Alias}';
  level1      @title : '{i18n>level1}';
  level1Title @title : '{i18n>level1Title}';
  level1Alias @title : '{i18n>level1Alias}';
  level2      @title : '{i18n>level2}';
  level2Title @title : '{i18n>level2Title}';
  level2Alias @title : '{i18n>level2Alias}';
  level3      @title : '{i18n>level3}';
  level3Title @title : '{i18n>level3Title}';
  level3Alias @title : '{i18n>level3Alias}';
};


annotate hierarchies.Hierarchies with {
  level0      @title : '{i18n>level0}';
  level0Title @title : '{i18n>level0Title}';
  level0Alias @title : '{i18n>level0Alias}';
  level1      @title : '{i18n>level1}';
  level1Title @title : '{i18n>level1Title}';
  level1Alias @title : '{i18n>level1Alias}';
  level2      @title : '{i18n>level2}';
  level2Title @title : '{i18n>level2Title}';
  level2Alias @title : '{i18n>level2Alias}';
  level3      @title : '{i18n>level3}';
  level3Title @title : '{i18n>level3Title}';
  level3Alias @title : '{i18n>level3Alias}';
};

annotate hierarchies.CategoriesLevel0 with {
  level0 @title : '{i18n>level0}';
};

annotate hierarchies.CategoriesLevel1 with {
  level0 @title : '{i18n>level0}';
  level1 @title : '{i18n>level1}';
};

annotate hierarchies.CategoriesLevel2 with {
  level0 @title : '{i18n>level0}';
  level1 @title : '{i18n>level1}';
  level2 @title : '{i18n>level2}';
};

annotate hierarchies.CategoriesLevel3 with {
  level0 @title : '{i18n>level0}';
  level1 @title : '{i18n>level1}';
  level2 @title : '{i18n>level2}';
  level3 @title : '{i18n>level3}';
};
