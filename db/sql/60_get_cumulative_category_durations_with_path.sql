create
or replace function get_cumulative_category_durations_with_path(
    p_tenant varchar,
    p_username varchar,
    p_date_from timestamp with time zone,
    p_date_until timestamp with time zone
) returns table (
    ID VARCHAR,
    tenant VARCHAR,
    parent_ID VARCHAR,
    title VARCHAR,
    hierarchyLevel VARCHAR,
    totalDuration NUMERIC,
    accumulatedDuration NUMERIC,
    deepReference VARCHAR
) language plpgsql as $$ #variable_conflict use_column
begin RETURN QUERY
SELECT
    dur.ID,
    dur.tenant,
    dur.parent_ID,
    dur.title,
    dur.hierarchyLevel,
    dur.totalDuration,
    dur.accumulatedDuration,
    pathCTE.deepReference
FROM
    get_cumulative_category_durations(p_tenant, p_username, p_date_from, p_date_until) as dur
    JOIN iot_planner_categories_cte as pathCTE on pathCTE.ID = dur.ID;
end $$;