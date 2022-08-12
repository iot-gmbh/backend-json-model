CREATE
OR REPLACE VIEW iot_planner_categoriesaggr AS
SELECT
    cte.*,
    case
        when dur.totalDuration is null then 0
        else cast (dur.totalDuration as Integer)
    end as totalDuration
FROM
    iot_planner_categories_cte as cte
    left outer join iot_planner_categories_total_durations as dur on cte.ID = dur.ID;