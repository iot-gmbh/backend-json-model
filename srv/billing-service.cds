using {iot.planner as my} from '../db/schema';

service BillingService @(requires: 'authenticated-user') {

  entity Hierarchies as projection on my.hierarchies.Hierarchies;

  @cds.redirection.target
  entity Categories  as projection on my.Categories;

  entity MyWorkItems @(restrict: [
    {
      grant: 'READ',
      to   : 'authenticated-user',
      where: 'assignedToUserPrincipalName = $user or managerUserPrincipalName = $user'
    },
    {
      grant: 'READ',
      to   : 'admin',
    },
  ])                 as
    select from my.WorkItems {
      key ID,
          title,
          location,
          duration,
          activatedDate                        as workDate  : String,
          ''                                   as startTime : String,
          completedDate                        as endTime   : String,
          assignedTo.userPrincipalName         as assignedToUserPrincipalName,
          assignedTo.manager.userPrincipalName as managerUserPrincipalName,
          hierarchy.level0                     as customer,
          hierarchy.level1                     as project,
          hierarchy.level2                     as subProject,
          hierarchy.level3                     as workPackage,
          hierarchy.level0Alias                as customerText,
          hierarchy.level1Alias                as projectText,
          hierarchy.level2Alias                as subProjectText,
          hierarchy.level3Alias                as workPackageText,
    }
    where
      deleted is null;

// entity Users       as projection on my.Users {
//   *,
//   workItems : redirected to WorkItems
// };
};
