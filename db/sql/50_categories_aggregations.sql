CREATE
OR REPLACE VIEW iot_planner_categories_aggregations AS
SELECT
    cte.*,
    dur.totalDuration
FROM
    iot_planner_categories_cte as cte
    left outer join iot_planner_categories_total_durations as dur on cte.ID = dur.ID;