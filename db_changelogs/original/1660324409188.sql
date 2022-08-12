drop view if exists "public"."iot_planner_categories_aggregations";

create or replace view "public"."iot_planner_categories_cte" as  WITH RECURSIVE cte AS (
         SELECT iot_planner_categories.id,
            iot_planner_categories.title,
            iot_planner_categories.description,
            iot_planner_categories.reference,
            iot_planner_categories.parent_id,
            iot_planner_categories.levelspecificid AS catnumber,
            iot_planner_categories.title AS path
           FROM iot_planner_categories
          WHERE (iot_planner_categories.parent_id IS NULL)
        UNION
         SELECT this.id,
            this.title,
            this.description,
            this.reference,
            this.parent_id,
            ((((prior.catnumber)::text || '-'::text) || (this.levelspecificid)::text))::character varying(5000) AS catnumber,
            ((((prior.path)::text || ' > '::text) || (this.title)::text))::character varying(5000) AS path
           FROM (cte prior
             JOIN iot_planner_categories this ON (((this.parent_id)::text = (prior.id)::text)))
        )
 SELECT cte.id,
    cte.title,
    cte.description,
    cte.reference,
    cte.parent_id,
    cte.catnumber,
    cte.path
   FROM cte;


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


create or replace view "public"."iot_planner_categoriesaggr" as  SELECT cte.id,
    cte.title,
    cte.description,
    cte.reference,
    cte.parent_id,
    cte.catnumber,
    cte.path,
    dur.totalduration
   FROM (iot_planner_categories_cte cte
     LEFT JOIN iot_planner_categories_total_durations dur ON (((cte.id)::text = (dur.id)::text)));



