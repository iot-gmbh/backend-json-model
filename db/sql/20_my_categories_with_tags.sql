CREATE
OR REPLACE VIEW iot_planner_my_categories_with_tags AS
SELECT
    cat.*,
    STRING_AGG(tag_title, ' ') as tags
FROM
    iot_planner_my_categories AS cat
    left outer join iot_planner_tags2categories as t2c on cat.ID = t2c.category_ID
group by
    cat.ID,
    cat.title,
    cat.tenant,
    cat.parent_ID,
    cat.description,
    cat.absoluteReference,
    cat.path,
    cat.deepReference,
    cat.shallowReference,
    cat.user_userPrincipalName;