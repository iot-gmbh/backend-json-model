create
or replace function get_categories(
    p_root varchar default null,
    p_date_from timestamp with time zone default now(),
    p_date_until timestamp with time zone default now()
) returns table (
    ID VARCHAR,
    tenant VARCHAR,
    parent_ID VARCHAR,
    title VARCHAR,
    hierarchyLevel VARCHAR,
    description VARCHAR,
    reference VARCHAR,
    catNumber VARCHAR,
    path VARCHAR
) language plpgsql as $$ 
#variable_conflict use_column
begin RETURN QUERY

WITH RECURSIVE cte AS (
    SELECT
        ID,
        tenant,
        parent_ID,
        title,
        hierarchyLevel,
        description,
        reference,
        levelSpecificID as catNumber,
        title as path
    FROM
        iot_planner_Categories
    WHERE
        -- if p_root is null (=> in case you want to get all elements of level 0), then parent_ID = null will return no results => in this case check for "parent_ID IS NULL"
		p_root is null and parent_ID is null or parent_ID = p_root
    UNION
    SELECT
        this.ID,
        this.tenant,
        this.parent_ID,
        this.title,
        this.hierarchyLevel,
        this.description,
        this.reference,
        CAST(
            (prior.catNumber || '-' || this.levelSpecificID) as varchar(5000)
        ) as catNumber,
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

end $$;