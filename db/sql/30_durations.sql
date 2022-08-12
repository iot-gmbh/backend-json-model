CREATE
OR REPLACE VIEW durations AS
SELECT
    cat.ID,
    cat.parent_ID,
    sum(duration) as totalDuration
FROM
    iot_planner_categories as cat
    JOIN iot_planner_workitems as wi on wi.parent_ID = cat.ID
GROUP BY
    cat.ID,
    cat.parent_ID;