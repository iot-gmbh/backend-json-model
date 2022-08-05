
-- Recursive CTE that returns descendants and ancestors of the categories that have been mapped to users, see https://stackoverflow.com/questions/17074950/recursive-cte-sql-to-return-all-decendants-and-ancestors
-- The hierarchical data is stored as an adjacent list, see https://www.databasestar.com/hierarchical-data-sql/#c2
-- Note: Recursive CTE's are not supported by HANA!: https://stackoverflow.com/questions/58090731/how-to-implement-recursion-in-hana-query
-- TODO: Make it work on SQLite

/* 
    childrenCTE: get all children of the categories, that have been assigned to my user via the n-m mapping table of iot_planner_Users2Categories 
    parentCTE: get all parents of my categories
    pathCTE: concat the titles along a path of the tree (from root) into a field named 'path'
*/

WITH RECURSIVE 
    childrenCTE AS (
      SELECT cat.ID, cat.title, cat.description, cat.parent_ID, cat.hierarchyLevel 
      FROM iot_planner_Categories AS cat
      INNER JOIN iot_planner_Users2Categories as user2cat
        on cat.ID = user2cat.category_ID
        and user2cat.user_userPrincipalName $1 $2
      UNION 
      SELECT this.ID, this.title, this.description, this.parent_ID, this.hierarchyLevel
      FROM childrenCTE AS parent 
      INNER JOIN iot_planner_Categories AS this 
          ON this.parent_ID = parent.ID
      ),
    parentCTE AS (
      SELECT cat.ID, cat.title, cat.description, cat.parent_ID, cat.hierarchyLevel 
      FROM iot_planner_Categories AS cat
      INNER JOIN iot_planner_Users2Categories as user2cat
        on cat.ID = user2cat.category_ID
        and user2cat.user_userPrincipalName $1 $2
      UNION 
      SELECT this.ID, this.title, this.description, this.parent_ID, this.hierarchyLevel
      FROM parentCTE AS children 
      INNER JOIN iot_planner_Categories AS this 
          ON children.parent_ID = this.ID
      ),
    pathCTE AS (
      SELECT cat.ID, cat.title, cat.parent_ID, cat.title as path
      FROM iot_planner_Categories AS cat
      WHERE cat.parent_ID IS NULL
      UNION 
      SELECT this.ID, this.title, this.parent_ID, CAST((prior.path || ' > ' || this.title) as varchar(5000)) as path 
      FROM pathCTE AS prior 
      INNER JOIN iot_planner_Categories AS this 
          ON this.parent_ID = prior.ID
    )
    SELECT * 
    FROM pathCTE
    JOIN childrenCTE on pathCTE.ID = childrenCTE.ID
    UNION
    SELECT * 
    FROM pathCTE
    JOIN parentCTE on pathCTE.ID = parentCTE.ID
    ORDER BY hierarchyLevel ASC;