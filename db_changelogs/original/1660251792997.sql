drop view if exists "public"."adminservice_categories";

drop view if exists "public"."analyticsservice_categories";

drop view if exists "public"."iot_planner_categories_cte";

drop view if exists "public"."iot_planner_my_categories";

drop view if exists "public"."iot_planner_my_categories_with_tags";

drop view if exists "public"."timetrackingservice_categories";

drop view if exists "public"."timetrackingservice_mycategories";

drop view if exists "public"."workitemsservice_categories";

drop view if exists "public"."workitemsservice_hierarchies";

drop view if exists "public"."workitemsservice_iotworkitems";

drop view if exists "public"."iot_planner_hierarchies_hierarchies";

alter table "public"."iot_planner_categories" alter column "hierarchylevel" set data type character varying(5000) using "hierarchylevel"::character varying(5000);

create or replace view "public"."adminservice_categories" as  SELECT categories_0.id,
    categories_0.createdat,
    categories_0.createdby,
    categories_0.modifiedat,
    categories_0.modifiedby,
    categories_0.invoicerelevance,
    categories_0.bonusrelevance,
    categories_0.tenant,
    categories_0.title,
    categories_0.description,
    categories_0.reference,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.hierarchylevel,
    categories_0.levelspecificid,
    categories_0.catnumber,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


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


create or replace view "public"."iot_planner_hierarchies_hierarchies" as  SELECT categories_0.id,
        CASE parent_1.hierarchylevel
            WHEN '0'::text THEN parent_1.id
            WHEN '1'::text THEN parent_2.id
            WHEN '2'::text THEN parent_3.id
            WHEN '3'::text THEN parent_4.id
            ELSE NULL::character varying
        END AS level0,
        CASE parent_1.hierarchylevel
            WHEN '1'::text THEN parent_1.id
            WHEN '2'::text THEN parent_2.id
            WHEN '3'::text THEN parent_3.id
            ELSE NULL::character varying
        END AS level1,
        CASE parent_1.hierarchylevel
            WHEN '2'::text THEN parent_1.id
            WHEN '3'::text THEN parent_2.id
            ELSE NULL::character varying
        END AS level2,
        CASE parent_1.hierarchylevel
            WHEN '3'::text THEN parent_1.id
            ELSE NULL::character varying
        END AS level3,
        CASE parent_1.hierarchylevel
            WHEN '0'::text THEN parent_1.title
            WHEN '1'::text THEN parent_2.title
            WHEN '2'::text THEN parent_3.title
            WHEN '3'::text THEN parent_4.title
            ELSE NULL::character varying
        END AS level0title,
        CASE parent_1.hierarchylevel
            WHEN '1'::text THEN parent_1.title
            WHEN '2'::text THEN parent_2.title
            WHEN '3'::text THEN parent_3.title
            ELSE NULL::character varying
        END AS level1title,
        CASE parent_1.hierarchylevel
            WHEN '2'::text THEN parent_1.title
            WHEN '3'::text THEN parent_2.title
            ELSE NULL::character varying
        END AS level2title,
        CASE parent_1.hierarchylevel
            WHEN '3'::text THEN parent_1.title
            ELSE NULL::character varying
        END AS level3title,
        CASE parent_1.hierarchylevel
            WHEN '0'::text THEN parent_1.mappingid
            WHEN '1'::text THEN parent_2.mappingid
            WHEN '2'::text THEN parent_3.mappingid
            WHEN '3'::text THEN parent_4.mappingid
            ELSE NULL::character varying
        END AS level0mappingid,
        CASE parent_1.hierarchylevel
            WHEN '1'::text THEN parent_1.mappingid
            WHEN '2'::text THEN parent_2.mappingid
            WHEN '3'::text THEN parent_3.mappingid
            ELSE NULL::character varying
        END AS level1mappingid,
        CASE parent_1.hierarchylevel
            WHEN '2'::text THEN parent_1.mappingid
            WHEN '3'::text THEN parent_2.mappingid
            ELSE NULL::character varying
        END AS level2mappingid,
        CASE parent_1.hierarchylevel
            WHEN '3'::text THEN parent_1.mappingid
            ELSE NULL::character varying
        END AS level3mappingid
   FROM ((((iot_planner_categories categories_0
     LEFT JOIN iot_planner_categories parent_1 ON (((categories_0.parent_id)::text = (parent_1.id)::text)))
     LEFT JOIN iot_planner_categories parent_2 ON (((parent_1.parent_id)::text = (parent_2.id)::text)))
     LEFT JOIN iot_planner_categories parent_3 ON (((parent_2.parent_id)::text = (parent_3.id)::text)))
     LEFT JOIN iot_planner_categories parent_4 ON (((parent_3.parent_id)::text = (parent_4.id)::text)));


create or replace view "public"."iot_planner_my_categories" as  SELECT sub.id,
    sub.title,
    sub.description,
    sub.reference,
    sub.parent_id,
    sub.catnumber,
    sub.path,
    sub.user_userprincipalname
   FROM ( WITH RECURSIVE childrencte AS (
                 SELECT cat.id,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.parent_id,
                    parent.user_userprincipalname
                   FROM (childrencte parent
                     JOIN iot_planner_categories this ON (((this.parent_id)::text = (parent.id)::text)))
                ), parentcte AS (
                 SELECT cat.id,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.parent_id,
                    children.user_userprincipalname
                   FROM (parentcte children
                     JOIN iot_planner_categories this ON (((children.parent_id)::text = (this.id)::text)))
                ), pathcte AS (
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
            pathcte.path,
            childrencte.user_userprincipalname
           FROM (pathcte
             JOIN childrencte ON (((pathcte.id)::text = (childrencte.id)::text)))
        UNION
         SELECT pathcte.id,
            pathcte.title,
            pathcte.description,
            pathcte.reference,
            pathcte.parent_id,
            pathcte.catnumber,
            pathcte.path,
            parentcte.user_userprincipalname
           FROM (pathcte
             JOIN parentcte ON (((pathcte.id)::text = (parentcte.id)::text)))) sub;


create or replace view "public"."iot_planner_my_categories_with_tags" as  SELECT sub.id,
    sub.title,
    sub.description,
    sub.reference,
    sub.parent_id,
    sub.catnumber,
    sub.path,
    sub.user_userprincipalname,
    string_agg((t2c.tag_title)::text, ' '::text) AS tags
   FROM (( WITH RECURSIVE childrencte AS (
                 SELECT cat.id,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.parent_id,
                    parent.user_userprincipalname
                   FROM (childrencte parent
                     JOIN iot_planner_categories this ON (((this.parent_id)::text = (parent.id)::text)))
                ), parentcte AS (
                 SELECT cat.id,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.parent_id,
                    children.user_userprincipalname
                   FROM (parentcte children
                     JOIN iot_planner_categories this ON (((children.parent_id)::text = (this.id)::text)))
                ), pathcte AS (
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
            pathcte.path,
            childrencte.user_userprincipalname
           FROM (pathcte
             JOIN childrencte ON (((pathcte.id)::text = (childrencte.id)::text)))
        UNION
         SELECT pathcte.id,
            pathcte.title,
            pathcte.description,
            pathcte.reference,
            pathcte.parent_id,
            pathcte.catnumber,
            pathcte.path,
            parentcte.user_userprincipalname
           FROM (pathcte
             JOIN parentcte ON (((pathcte.id)::text = (parentcte.id)::text)))) sub
     LEFT JOIN iot_planner_tags2categories t2c ON (((sub.id)::text = (t2c.category_id)::text)))
  GROUP BY sub.id, sub.title, sub.parent_id, sub.description, sub.reference, sub.path, sub.catnumber, sub.user_userprincipalname;


create or replace view "public"."timetrackingservice_categories" as  SELECT categories_0.id,
    categories_0.createdat,
    categories_0.createdby,
    categories_0.modifiedat,
    categories_0.modifiedby,
    categories_0.invoicerelevance,
    categories_0.bonusrelevance,
    categories_0.tenant,
    categories_0.title,
    categories_0.description,
    categories_0.reference,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.hierarchylevel,
    categories_0.levelspecificid,
    categories_0.catnumber,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


create or replace view "public"."timetrackingservice_mycategories" as  SELECT categories_0.id,
    categories_0.createdat,
    categories_0.createdby,
    categories_0.modifiedat,
    categories_0.modifiedby,
    categories_0.invoicerelevance,
    categories_0.bonusrelevance,
    categories_0.tenant,
    categories_0.title,
    categories_0.description,
    categories_0.reference,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.hierarchylevel,
    categories_0.levelspecificid,
    categories_0.catnumber,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


create or replace view "public"."workitemsservice_categories" as  SELECT categories_0.id,
    categories_0.createdat,
    categories_0.createdby,
    categories_0.modifiedat,
    categories_0.modifiedby,
    categories_0.invoicerelevance,
    categories_0.bonusrelevance,
    categories_0.tenant,
    categories_0.title,
    categories_0.description,
    categories_0.reference,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.hierarchylevel,
    categories_0.levelspecificid,
    categories_0.catnumber,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


create or replace view "public"."workitemsservice_hierarchies" as  SELECT hierarchies_0.id,
    hierarchies_0.level0,
    hierarchies_0.level1,
    hierarchies_0.level2,
    hierarchies_0.level3,
    hierarchies_0.level0title,
    hierarchies_0.level1title,
    hierarchies_0.level2title,
    hierarchies_0.level3title,
    hierarchies_0.level0mappingid,
    hierarchies_0.level1mappingid,
    hierarchies_0.level2mappingid,
    hierarchies_0.level3mappingid
   FROM iot_planner_hierarchies_hierarchies hierarchies_0;


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



