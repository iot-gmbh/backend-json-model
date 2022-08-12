CREATE
OR REPLACE VIEW iot_planner_my_categories -- Recursive CTE that returns descendants and ancestors of the categories that have been mapped to users, see https://stackoverflow.com/questions/17074950/recursive-cte-sql-to-return-all-decendants-and-ancestors
-- The hierarchical data is stored as an adjacent list, see https://www.databasestar.com/hierarchical-data-sql/#c2
-- Note: Recursive CTE's are not supported by HANA!: https://stackoverflow.com/questions/58090731/how-to-implement-recursion-in-hana-query
-- TODO: Make it work on SQLite
/* 
 childrenCTE: get all children of the categories, that have been assigned to my user via the n-m mapping table of iot_planner_Users2Categories 
 parentCTE: get all parents of my categories
 pathCTE: concat the titles along a path of the tree (from root) into a field named 'path'
 */
AS
SELECT
  *
FROM
  (
    WITH RECURSIVE childrenCTE AS (
      SELECT
        cat.ID,
        cat.parent_ID,
        user2cat.user_userPrincipalName
      FROM
        iot_planner_Categories AS cat
        INNER JOIN iot_planner_Users2Categories as user2cat on cat.ID = user2cat.category_ID
      UNION
      SELECT
        this.ID,
        this.parent_ID,
        parent.user_userPrincipalName
      FROM
        childrenCTE AS parent
        INNER JOIN iot_planner_Categories AS this ON this.parent_ID = parent.ID
    ),
    parentCTE AS (
      SELECT
        cat.ID,
        cat.parent_ID,
        user2cat.user_userPrincipalName
      FROM
        iot_planner_Categories AS cat
        INNER JOIN iot_planner_Users2Categories as user2cat on cat.ID = user2cat.category_ID
      UNION
      SELECT
        this.ID,
        this.parent_ID,
        children.user_userPrincipalName
      FROM
        parentCTE AS children
        INNER JOIN iot_planner_Categories AS this ON children.parent_ID = this.ID
    ),
    pathCTE AS (
      SELECT
        *
      FROM
        iot_planner_categories_cte
    )
    SELECT
      pathCTE.*,
      childrenCTE.user_userPrincipalName
    FROM
      pathCTE
      JOIN childrenCTE on pathCTE.ID = childrenCTE.ID
    UNION
    SELECT
      pathCTE.*,
      parentCTE.user_userPrincipalName
    FROM
      pathCTE
      JOIN parentCTE on pathCTE.ID = parentCTE.ID
  ) sub;