using {iot.planner as my} from '../db/schema';

service VacationsService {
    entity Vacations as projection on my.Vacations;
    entity Users as projection on my.Users {
        *,
        // isnull(sum(vacations.durationInDays), 0)
        //     as vacDaysTotal : Integer,
        sum(vacations.durationInDays)
            as vacDaysTotal : Integer,
        yearlyVacDays - sum(vacations.durationInDays)
            as vacDaysRemaining : Integer
    } group by userPrincipalName
}