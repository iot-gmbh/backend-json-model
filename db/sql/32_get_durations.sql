create
or replace function get_durations(
    p_username varchar,
    p_date_from timestamp with time zone,
    p_date_until timestamp with time zone
) returns table (
    ID VARCHAR,
    tenant VARCHAR,
    parent_ID VARCHAR,
    title VARCHAR,
    totalDuration numeric,
    dateFrom timestamp with time zone,
    dateUntil timestamp with time zone
) language plpgsql as $$ 
#variable_conflict use_column
begin RETURN QUERY
SELECT
    cat.ID,
    cat.tenant,
    cat.parent_ID,
    cat.title,
    sum(wi.duration) as totalDuration,
    p_date_from as dateFrom,
    p_date_until as dateUntil
FROM
    iot_planner_categories as cat
    LEFT OUTER JOIN iot_planner_workitems as wi on wi.parent_ID = cat.ID
    and wi.assignedTo_userPrincipalName ilike p_username
    and wi.activateddate > p_date_from
    and wi.activateddate < p_date_until
GROUP BY
    cat.ID,
    cat.tenant,
    cat.parent_ID,
    cat.title;

end

$$;