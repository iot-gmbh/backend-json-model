create or replace view "public"."iot_planner_categoriesaggr" as  SELECT sub.id,
    sub.tenant,
    sub.title,
    sub.parent_id,
        CASE
            WHEN (sub.totaldurationraw IS NULL) THEN (0)::numeric
            ELSE sub.totaldurationraw
        END AS totalduration
   FROM ( WITH RECURSIVE cte AS (
                 SELECT durations.id,
                    durations.tenant,
                    durations.title,
                    durations.parent_id,
                    durations.totalduration
                   FROM durations
                UNION ALL
                 SELECT this.id,
                    this.tenant,
                    this.title,
                    this.parent_id,
                    this.totalduration
                   FROM (durations this
                     JOIN cte prior ON (((prior.parent_id)::text = (this.id)::text)))
                )
         SELECT cte.id,
            cte.tenant,
            cte.title,
            cte.parent_id,
            sum(cte.totalduration) AS totaldurationraw
           FROM cte
          GROUP BY cte.id, cte.tenant, cte.title, cte.parent_id) sub;


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



