create
or replace function get_cumulative_category_durations(
    p_username varchar,
    p_date_from timestamp with time zone,
    p_date_until timestamp with time zone
) returns table (
    ID VARCHAR,
    tenant VARCHAR,
    parent_ID VARCHAR,
    title VARCHAR,
    totalDuration numeric
) language plpgsql as $$ #variable_conflict use_column
begin RETURN QUERY
/* for reference: https://stackoverflow.com/questions/26660189/recursive-query-with-sum-in-postgres */
WITH RECURSIVE cte AS (
    SELECT
        ID,
        ID as parent_ID,
        tenant,
        parent_ID as parent,
        title,
        totalDuration
    FROM
        get_durations(p_username, p_date_from, p_date_until)
    UNION
    ALL
    SELECT
        c.ID,
        d.ID,
        c.tenant,
        c.parent,
        c.title,
        d.totalDuration
    FROM
        cte c
        JOIN get_durations(p_username, p_date_from, p_date_until) d on c.parent_ID = d.parent_ID
)
SELECT
    ID,
    tenant,
    parent as parent_ID,
    title,
    sum(totalDuration) AS totalDuration
FROM
    cte 
GROUP BY
    ID,
    tenant,
    parent,
    title;

end $$;