CREATE
OR REPLACE VIEW durations AS
SELECT
    cat.ID,
    cat.tenant,
    cat.title,
    cat.parent_ID,
    sum(wi.duration) as totalDuration
FROM
    iot_planner_categories as cat
    LEFT OUTER JOIN iot_planner_workitems as wi on wi.parent_ID = cat.ID
GROUP BY
    cat.ID,
    cat.tenant,
    cat.title,
    cat.parent_ID;