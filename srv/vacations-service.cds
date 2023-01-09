using {iot.planner as my} from '../db/schema';

service VacationsService @(requires : 'authenticated-user') {
  entity Vacations @(restrict : [
    {
      grant : '*',
      to    : 'team-lead',
      // Association paths are currently supported on SAP HANA only
      // https://cap.cloud.sap/docs/guides/authorization#association-paths
      where : 'userManager = $user'
    },
    {
      grant : '*',
      to    : 'authenticated-user',
      where : 'user_userPrincipalName = $user'
    },
    {
      grant : '*',
      to    : 'admin',
    },
  ]) as projection on my.Vacations {
    *,
    user.manager.userPrincipalName as userManager
  };

  entity Users @(restrict : [
    {
      grant : '*',
      to    : 'team-lead',
      // Association paths are currently supported on SAP HANA only
      // https://cap.cloud.sap/docs/guides/authorization#association-paths
      where : 'manager = $user'
    },
    {
      grant : '*',
      to    : 'authenticated-user',
      where : 'userPrincipalName = $user'
    },
    {
      grant : '*',
      to    : 'admin',
    },
  ]) as projection on my.Users {
    *,

    // vacDaysTotal is either the sum of all vacation
    // days or 0
    coalesce(
      sum(
        vacations.durationInDays
      ), 0) as vacDaysTotal     : Integer,

    yearlyVacDays - coalesce(
      sum(
        vacations.durationInDays
      ), 0) as vacDaysRemaining : Integer
    } group by userPrincipalName
}
