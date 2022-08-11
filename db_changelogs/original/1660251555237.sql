drop view if exists "public"."analyticsservice_categories";

drop view if exists "public"."timetrackingservice_categorylevels";

alter table "public"."iot_planner_categorylevels" drop constraint "iot_planner_categorylevels_pkey";

drop index if exists "public"."iot_planner_categorylevels_pkey";

alter table "public"."iot_planner_categorylevels" alter column "hierarchylevel" set data type character varying(5000) using "hierarchylevel"::character varying(5000);

CREATE UNIQUE INDEX iot_planner_categorylevels_pkey ON public.iot_planner_categorylevels USING btree (hierarchylevel);

alter table "public"."iot_planner_categorylevels" add constraint "iot_planner_categorylevels_pkey" PRIMARY KEY using index "iot_planner_categorylevels_pkey";

create or replace view "public"."analyticsservice_categories" as  SELECT cat_0.id,
    wi_1.assignedtouserprincipalname,
    wi_1.activateddate,
    wi_1.completeddate,
    wi_1.activateddatemonth,
    wi_1.activateddateyear,
    wi_1.duration,
    cat_0.title AS parenttitle,
    cat_0.parent_id,
    wi_1.assignedto_userprincipalname,
    'expanded'::text AS drilldownstate,
    cat_0.hierarchylevel,
    cat_0.tenant
   FROM (workitemsservice_categories cat_0
     LEFT JOIN workitemsservice_workitems wi_1 ON (((wi_1.parent_id)::text = (cat_0.id)::text)))
  WHERE (wi_1.deleted IS NULL);


create or replace view "public"."timetrackingservice_categorylevels" as  SELECT categorylevels_0.tenant,
    categorylevels_0.hierarchylevel,
    categorylevels_0.title
   FROM iot_planner_categorylevels categorylevels_0;


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
    workitems_0.tenant,
    assignedto_2.manager_userprincipalname AS manageruserprincipalname,
    workitems_0.id
   FROM ((iot_planner_workitems workitems_0
     LEFT JOIN iot_planner_hierarchies_hierarchies hierarchy_1 ON (((workitems_0.parent_id)::text = (hierarchy_1.id)::text)))
     LEFT JOIN iot_planner_users assignedto_2 ON (((workitems_0.assignedto_userprincipalname)::text = (assignedto_2.userprincipalname)::text)))
  WHERE (workitems_0.deleted IS NULL);



