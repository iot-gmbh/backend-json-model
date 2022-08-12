CREATE
OR REPLACE VIEW iot_planner_categories_total_durations AS
SELECT
    *
FROM
    (
        WITH RECURSIVE cte AS (
            SELECT
                ID,
                parent_ID,
                totalDuration
            FROM
                durations
            UNION
            ALL
            SELECT
                this.ID,
                this.parent_ID,
                this.totalDuration
            FROM
                durations AS this
                JOIN cte as prior on prior.parent_ID = this.ID
        )
        SELECT
            cte.ID,
            cte.parent_ID,
            sum(totalDuration) AS totalDuration
        FROM
            cte -- left outer join pathCTE on pathCTE.ID = cte.ID
        GROUP BY
            cte.ID,
            cte.parent_ID
    ) sub;