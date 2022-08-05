drop view if exists "public"."timetrackingservice_matchcategory2workitem";

drop view if exists "public"."iot_planner_matchcategory2workitem";

create or replace view "public"."iot_planner_categories2tagsorderedbytags" as  SELECT tags2categories_0.tag_title AS tagtitle,
    category_1.id AS categoryid,
    category_1.title AS categorytitle,
    category_1.tenant
   FROM (iot_planner_tags2categories tags2categories_0
     LEFT JOIN iot_planner_categories category_1 ON (((tags2categories_0.category_id)::text = (category_1.id)::text)))
  ORDER BY tags2categories_0.tag_title;


create or replace view "public"."iot_planner_matchcategory2tags" as  SELECT categories2tagsorderedbytags_0.categoryid,
    categories2tagsorderedbytags_0.categorytitle,
    categories2tagsorderedbytags_0.tenant,
    string_agg((categories2tagsorderedbytags_0.tagtitle)::text, ','::text) AS tags
   FROM iot_planner_categories2tagsorderedbytags categories2tagsorderedbytags_0
  GROUP BY categories2tagsorderedbytags_0.categoryid, categories2tagsorderedbytags_0.categorytitle, categories2tagsorderedbytags_0.tenant;


create or replace view "public"."timetrackingservice_matchcategory2tags" as  SELECT matchcategory2tags_0.categoryid,
    matchcategory2tags_0.categorytitle,
    matchcategory2tags_0.tenant,
    matchcategory2tags_0.tags
   FROM iot_planner_matchcategory2tags matchcategory2tags_0;


create or replace view "public"."workitemsservice_iotworkitems" as  SELECT workitems_0.activateddate AS datum,
    workitems_0.completeddate AS datumbis,
    ''::text AS beginn,
    ''::text AS ende,
    ''::text AS p1,
    hierarchy_1.level1mappingid AS projekt,
    hierarchy_1.level2mappingid AS teilprojekt,
    hierarchy_1.level3mappingid AS arbeitspaket,
    'Durchf�hrung'::text AS taetigkeit,
    assignedto_2.userprincipalname AS nutzer,
    'GE'::text AS einsatzort,
    workitems_0.title AS bemerkung,
    assignedto_2.manager_userprincipalname AS manageruserprincipalname,
    workitems_0.id
   FROM ((iot_planner_workitems workitems_0
     LEFT JOIN iot_planner_hierarchies_hierarchies hierarchy_1 ON (((workitems_0.parent_id)::text = (hierarchy_1.parent)::text)))
     LEFT JOIN iot_planner_users assignedto_2 ON (((workitems_0.assignedto_userprincipalname)::text = (assignedto_2.userprincipalname)::text)))
  WHERE (workitems_0.deleted IS NULL);



