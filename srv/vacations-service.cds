using {iot.planner as my} from '../db/schema';

service VacationsService {
    entity Vacations as projection on my.Vacations;
    entity Users as projection on my.Users {
        *,
        sum(vacations.durationInDays)
            as vacDaysTotal : Integer,
        yearlyVacDays - sum(vacations.durationInDays)
            as vacDaysRemaining : Integer
    } group by userPrincipalName
}