CREATE
OR REPLACE VIEW iot_planner_categories_cte -- Recursive CTE that returns descendants and ancestors of the categories that have been mapped to users, see https://stackoverflow.com/questions/17074950/recursive-cte-sql-to-return-all-decendants-and-ancestors
-- The hierarchical data is stored as an adjacent list, see https://www.databasestar.com/hierarchical-data-sql/#c2
-- Note: Recursive CTE's are not supported by HANA!: https://stackoverflow.com/questions/58090731/how-to-implement-recursion-in-hana-query
-- TODO: Make it work on SQLite
/* 
 childrenCTE: get all children of the categories, that have been assigned to my user via the n-m mapping table of iot_planner_Users2Categories 
 parentCTE: get all parents of my categories
 cte: concat the titles along a path of the tree (from root) into a field named 'path'
 */
AS WITH RECURSIVE cte AS (
    SELECT
        ID,
        tenant,
        title,
        description,
        reference,
        parent_ID,
        shallowReference as deepReference,
        title as path
    FROM
        iot_planner_Categories
    WHERE
        parent_ID IS NULL
    UNION
    SELECT
        this.ID,
        this.tenant,
        this.title,
        this.description,
        this.reference,
        this.parent_ID,
        CAST(
            (prior.deepReference || '-' || this.shallowReference) as varchar(5000)
        ) as deepReference,
        CAST(
            (prior.path || ' > ' || this.title) as varchar(5000)
        ) as path
    FROM
        cte AS prior
        INNER JOIN iot_planner_Categories AS this ON this.parent_ID = prior.ID
)
SELECT
    cte.*
FROM
    cte;