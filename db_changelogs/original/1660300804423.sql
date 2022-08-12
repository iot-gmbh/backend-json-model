drop view if exists "public"."duration";

drop view if exists "public"."iot_planner_categories_aggr";

drop view if exists "public"."iot_planner_categories_aggr1";

drop view if exists "public"."iot_planner_categories_join_workitems";

drop view if exists "public"."iot_planner_categories_aggregations";

drop view if exists "public"."iot_planner_categories_total_durations";

drop view if exists "public"."durations";

drop table "public"."temp_cat_durations";

drop table "public"."temp_dur";

drop table "public"."temp_durations";

create or replace view "public"."durations" as  SELECT cat.id,
    cat.parent_id,
    sum(wi.duration) AS totalduration
   FROM (iot_planner_categories cat
     JOIN iot_planner_workitems wi ON (((wi.parent_id)::text = (cat.id)::text)))
  GROUP BY cat.id, cat.parent_id;


create or replace view "public"."iot_planner_categories_total_durations" as  SELECT sub.id,
    sub.parent_id,
    sub.totalduration
   FROM ( WITH RECURSIVE cte AS (
                 SELECT durations.id,
                    durations.parent_id,
                    durations.totalduration
                   FROM durations
                UNION ALL
                 SELECT this.id,
                    this.parent_id,
                    this.totalduration
                   FROM (durations this
                     JOIN cte prior ON (((prior.parent_id)::text = (this.id)::text)))
                )
         SELECT cte.id,
            cte.parent_id,
            sum(cte.totalduration) AS totalduration
           FROM cte
          GROUP BY cte.id, cte.parent_id) sub;


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


create or replace view "public"."iot_planner_categories_aggregations" as  SELECT cte.id,
    cte.title,
    cte.description,
    cte.reference,
    cte.parent_id,
    cte.catnumber,
    cte.path,
    dur.totalduration
   FROM (iot_planner_categories_cte cte
     LEFT JOIN iot_planner_categories_total_durations dur ON (((cte.id)::text = (dur.id)::text)));



