create or replace view "public"."iot_planner_categoriesaggr" as  SELECT cte.id,
    cte.tenant,
    cte.title,
    cte.description,
    cte.reference,
    cte.parent_id,
    cte.catnumber,
    cte.path,
        CASE
            WHEN (dur.totalduration IS NULL) THEN 0
            ELSE (dur.totalduration)::integer
        END AS totalduration
   FROM (iot_planner_categories_cte cte
     LEFT JOIN iot_planner_categories_total_durations dur ON (((cte.id)::text = (dur.id)::text)));


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



