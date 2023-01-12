create
or replace function get_categories(
    p_tenant varchar,
    p_root varchar default null,
    p_valid_at timestamp with time zone default now()
) returns table (
    ID VARCHAR,
    tenant VARCHAR,
    parent_ID VARCHAR,
    title VARCHAR,
    hierarchyLevel VARCHAR,
    description VARCHAR,
    validFrom timestamp with time zone,
    validTo timestamp with time zone,
    invoiceRelevance NUMERIC,
    bonusRelevance NUMERIC,
    absoluteReference VARCHAR,
    shallowReference VARCHAR,
    deepReference VARCHAR,
    path VARCHAR
) language plpgsql as $$ #variable_conflict use_column
begin RETURN QUERY WITH RECURSIVE cte AS (
    SELECT
        ID,
        tenant,
        parent_ID,
        title,
        hierarchyLevel,
        description,
        validFrom,
        validTo,
        invoiceRelevance,
        bonusRelevance,
        absoluteReference,
        shallowReference,
        shallowReference as deepReference,
        title as path
    FROM
        iot_planner_Categories
    WHERE
        -- if p_root is null (=> in case you want to get all elements of level 0), then parent_ID = null will return no results => in this case check for "hierarchyLevel = 0"
        tenant = p_tenant
        and validFrom <= p_valid_at
        and validTo > p_valid_at
        and (
            p_root is null
            and hierarchyLevel = '0'
            or ID = p_root
        )
    UNION
    SELECT
        this.ID,
        this.tenant,
        this.parent_ID,
        this.title,
        this.hierarchyLevel,
        this.description,
        this.validFrom,
        this.validTo,
        this.invoiceRelevance,
        this.bonusRelevance,
        this.absoluteReference,
        this.shallowReference,
        CAST(
            (prior.deepReference || '-' || this.shallowReference) as varchar(5000)
        ) as deepReference,
        CAST(
            (prior.path || ' > ' || this.title) as varchar(5000)
        ) as path
    FROM
        cte AS prior
        INNER JOIN iot_planner_Categories AS this ON this.parent_ID = prior.ID
        and this.tenant = p_tenant
        and this.validFrom <= p_valid_at
        and this.validTo > p_valid_at
)
SELECT
    cte.*
FROM
    cte;

end $$;