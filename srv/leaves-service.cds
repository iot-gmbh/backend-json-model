using {iot.planner as my} from '../db/schema';

service LeavesService @(requires: 'authenticated-user') {
  entity Leaves @(restrict: [
    {
      grant: '*',
      to   : 'authenticated-user',
      where: 'user_userPrincipalName = $user or userManager = $user'
    },
    {
      grant: '*',
      to   : 'admin',
    },
  ]) as projection on my.Leaves {
    *,
    user.manager.userPrincipalName as userManager
  };

  entity Users @(restrict: [
    {
      grant: '*',
      to   : 'authenticated-user',
      where: 'userPrincipalName = $user or userManager = $user'
    },
    {
      grant: '*',
      to   : 'admin',
    },
  ]) as projection on my.Users {
    *,
    manager.userPrincipalName as userManager,
    // vacDaysTotal is either the sum of all leave days or 0
    coalesce(
      sum(
        leaves.durationInDays
      ), 0
    )                         as vacDaysTotal     : Integer,

    yearlyVacDays - coalesce(
      sum(
        leaves.durationInDays
      ), 0
    )                         as vacDaysRemaining : Integer
  } group by userPrincipalName
}
