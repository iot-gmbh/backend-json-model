create table "public"."iot_planner_tags2categories" (
    "id" character varying(36) not null,
    "tenant" character varying(5000),
    "tag_title" character varying(5000),
    "category_id" character varying(36)
);


CREATE UNIQUE INDEX iot_planner_tags2categories_pkey ON public.iot_planner_tags2categories USING btree (id);

alter table "public"."iot_planner_tags2categories" add constraint "iot_planner_tags2categories_pkey" PRIMARY KEY using index "iot_planner_tags2categories_pkey";

create or replace view "public"."adminservice_tags2categories" as  SELECT tags2categories_0.id,
    tags2categories_0.tenant,
    tags2categories_0.tag_title,
    tags2categories_0.category_id
   FROM iot_planner_tags2categories tags2categories_0;


create or replace view "public"."iot_planner_matchcategory2workitem" as  SELECT t2w_0.workitem_id AS workitemid,
    t2c_1.category_id AS categoryid,
    t2w_0.tenant,
    rank() OVER (PARTITION BY t2c_1.category_id ORDER BY (count(*)) DESC) AS noofmatchingtags
   FROM (iot_planner_tags2workitems t2w_0
     JOIN iot_planner_tags2categories t2c_1 ON (((t2w_0.tag_title)::text = (t2c_1.tag_title)::text)))
  GROUP BY t2c_1.category_id, t2w_0.workitem_id, t2w_0.tenant;


create or replace view "public"."timetrackingservice_matchcategory2workitem" as  SELECT matchcategory2workitem_0.workitemid,
    matchcategory2workitem_0.categoryid,
    matchcategory2workitem_0.tenant,
    matchcategory2workitem_0.noofmatchingtags
   FROM iot_planner_matchcategory2workitem matchcategory2workitem_0;


create or replace view "public"."timetrackingservice_tags2categories" as  SELECT tags2categories_0.id,
    tags2categories_0.tenant,
    tags2categories_0.tag_title,
    tags2categories_0.category_id
   FROM iot_planner_tags2categories tags2categories_0;


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



