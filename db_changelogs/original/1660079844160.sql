create or replace view "public"."iot_planner_categories_cte" as  WITH RECURSIVE pathcte AS (
         SELECT cat.id,
            cat.title,
            cat.description,
            cat.reference,
            cat.parent_id,
            cat.levelspecificid AS catnumber,
            cat.title AS path
           FROM iot_planner_categories cat
          WHERE (cat.parent_id IS NULL)
        UNION
         SELECT this.id,
            this.title,
            this.description,
            this.reference,
            this.parent_id,
            ((((prior.catnumber)::text || '-'::text) || (this.levelspecificid)::text))::character varying(5000) AS catnumber,
            ((((prior.path)::text || ' > '::text) || (this.title)::text))::character varying(5000) AS path
           FROM (pathcte prior
             JOIN iot_planner_categories this ON (((this.parent_id)::text = (prior.id)::text)))
        )
 SELECT pathcte.id,
    pathcte.title,
    pathcte.description,
    pathcte.reference,
    pathcte.parent_id,
    pathcte.catnumber,
    pathcte.path
   FROM pathcte;


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



