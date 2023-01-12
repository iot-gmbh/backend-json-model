using {iot.planner as my} from '../db/schema';

service LeavesService @(requires: 'authenticated-user') {
  entity Leaves @(restrict: [
    {
      grant: '*',
      to   : 'team-lead',
      // Association paths are currently supported on SAP HANA only
      // https://cap.cloud.sap/docs/guides/authorization#association-paths
      where: 'userManager = $user'
    },
    {
      grant: '*',
      to   : 'authenticated-user',
      where: 'user_userPrincipalName = $user'
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
      to   : 'team-lead',
      // Association paths are currently supported on SAP HANA only
      // https://cap.cloud.sap/docs/guides/authorization#association-paths
      where: 'userManager = $user'
    },
    {
      grant: '*',
      to   : 'authenticated-user',
      where: 'userPrincipalName = $user'
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
