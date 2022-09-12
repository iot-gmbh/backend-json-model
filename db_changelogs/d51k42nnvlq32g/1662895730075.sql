drop view if exists "public"."workitemsservice_hierarchies";

drop view if exists "public"."workitemsservice_iotworkitems";

drop view if exists "public"."iot_planner_hierarchies_hierarchies";

create or replace view "public"."iot_planner_categoriescumulativedurations" as  SELECT categories_0.id,
    categories_0.tenant,
    categories_0.parent_id,
    categories_0.title,
    '2021-05-02 14:55:08.091+02'::timestamp with time zone AS activateddate,
    '2021-05-02 14:55:08.091+02'::timestamp with time zone AS completeddate,
    ''::character varying(5000) AS assignedto_userprincipalname,
    categories_0.totalduration
   FROM iot_planner_categories categories_0;


create or replace view "public"."iot_planner_hierarchies_hierarchies" as  SELECT categories_0.id,
        CASE categories_0.hierarchylevel
            WHEN '0'::text THEN categories_0.id
            WHEN '1'::text THEN parent_1.id
            WHEN '2'::text THEN parent_2.id
            WHEN '3'::text THEN parent_3.id
            ELSE NULL::character varying
        END AS level0,
        CASE categories_0.hierarchylevel
            WHEN '1'::text THEN categories_0.id
            WHEN '2'::text THEN parent_1.id
            WHEN '3'::text THEN parent_2.id
            ELSE NULL::character varying
        END AS level1,
        CASE categories_0.hierarchylevel
            WHEN '2'::text THEN categories_0.id
            WHEN '3'::text THEN parent_1.id
            ELSE NULL::character varying
        END AS level2,
        CASE categories_0.hierarchylevel
            WHEN '3'::text THEN categories_0.id
            ELSE NULL::character varying
        END AS level3,
        CASE categories_0.hierarchylevel
            WHEN '0'::text THEN categories_0.title
            WHEN '1'::text THEN parent_1.title
            WHEN '2'::text THEN parent_2.title
            WHEN '3'::text THEN parent_3.title
            ELSE NULL::character varying
        END AS level0title,
        CASE categories_0.hierarchylevel
            WHEN '1'::text THEN categories_0.title
            WHEN '2'::text THEN parent_1.title
            WHEN '3'::text THEN parent_2.title
            ELSE NULL::character varying
        END AS level1title,
        CASE categories_0.hierarchylevel
            WHEN '2'::text THEN categories_0.title
            WHEN '3'::text THEN parent_1.title
            ELSE NULL::character varying
        END AS level2title,
        CASE categories_0.hierarchylevel
            WHEN '3'::text THEN categories_0.title
            ELSE NULL::character varying
        END AS level3title,
        CASE categories_0.hierarchylevel
            WHEN '0'::text THEN categories_0.mappingid
            WHEN '1'::text THEN parent_1.mappingid
            WHEN '2'::text THEN parent_2.mappingid
            WHEN '3'::text THEN parent_3.mappingid
            ELSE NULL::character varying
        END AS level0alias,
        CASE categories_0.hierarchylevel
            WHEN '1'::text THEN categories_0.mappingid
            WHEN '2'::text THEN parent_1.mappingid
            WHEN '3'::text THEN parent_2.mappingid
            ELSE NULL::character varying
        END AS level1alias,
        CASE categories_0.hierarchylevel
            WHEN '2'::text THEN categories_0.mappingid
            WHEN '3'::text THEN parent_1.mappingid
            ELSE NULL::character varying
        END AS level2alias,
        CASE categories_0.hierarchylevel
            WHEN '3'::text THEN categories_0.mappingid
            ELSE NULL::character varying
        END AS level3alias
   FROM (((iot_planner_categories categories_0
     LEFT JOIN iot_planner_categories parent_1 ON (((categories_0.parent_id)::text = (parent_1.id)::text)))
     LEFT JOIN iot_planner_categories parent_2 ON (((parent_1.parent_id)::text = (parent_2.id)::text)))
     LEFT JOIN iot_planner_categories parent_3 ON (((parent_2.parent_id)::text = (parent_3.id)::text)));


create or replace view "public"."workitemsservice_hierarchies" as  SELECT hierarchies_0.id,
    hierarchies_0.level0,
    hierarchies_0.level1,
    hierarchies_0.level2,
    hierarchies_0.level3,
    hierarchies_0.level0title,
    hierarchies_0.level1title,
    hierarchies_0.level2title,
    hierarchies_0.level3title,
    hierarchies_0.level0alias,
    hierarchies_0.level1alias,
    hierarchies_0.level2alias,
    hierarchies_0.level3alias
   FROM iot_planner_hierarchies_hierarchies hierarchies_0;


create or replace view "public"."workitemsservice_iotworkitems" as  SELECT workitems_0.id,
    workitems_0.activateddate AS datum,
    workitems_0.completeddate AS datumbis,
    ''::text AS beginn,
    ''::text AS ende,
    ''::text AS p1,
    hierarchy_1.level0alias AS projektalias,
    hierarchy_1.level1alias AS teilprojektalias,
    hierarchy_1.level2alias AS arbeitspaketalias,
    'Durchf�hrung'::text AS taetigkeit,
    assignedto_2.userprincipalname AS nutzer,
    'GE'::text AS einsatzort,
    workitems_0.title AS bemerkung,
    workitems_0.tenant,
    assignedto_2.manager_userprincipalname AS manageruserprincipalname
   FROM ((iot_planner_workitems workitems_0
     LEFT JOIN iot_planner_hierarchies_hierarchies hierarchy_1 ON (((workitems_0.parent_id)::text = (hierarchy_1.id)::text)))
     LEFT JOIN iot_planner_users assignedto_2 ON (((workitems_0.assignedto_userprincipalname)::text = (assignedto_2.userprincipalname)::text)))
  WHERE (workitems_0.deleted IS NULL);



