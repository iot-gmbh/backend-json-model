CREATE
OR REPLACE VIEW iot_planner_categoriescumulativedurations AS
SELECT
    *
FROM
    (
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
                durations
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
                JOIN durations d on c.parent_ID = d.parent_ID
        )
        SELECT
            ID,
            tenant,
            title,
            parent as parent_ID,
            sum(totalDuration) AS totalDuration
        FROM
            cte
        GROUP BY
            ID,
            tenant,
            title,
            parent
    ) sub;