drop view if exists "public"."adminservice_categoriesaggr";

drop view if exists "public"."iot_planner_categoriesaggr";

drop view if exists "public"."iot_planner_my_categories_with_tags";

drop view if exists "public"."iot_planner_categories_total_durations";

drop view if exists "public"."iot_planner_my_categories";

drop view if exists "public"."durations";

drop view if exists "public"."iot_planner_categories_cte";

create or replace view "public"."durations" as  SELECT cat.id,
    cat.tenant,
    cat.parent_id,
    sum(wi.duration) AS totalduration
   FROM (iot_planner_categories cat
     JOIN iot_planner_workitems wi ON (((wi.parent_id)::text = (cat.id)::text)))
  GROUP BY cat.id, cat.tenant, cat.parent_id;


create or replace view "public"."iot_planner_categories_cte" as  WITH RECURSIVE cte AS (
         SELECT iot_planner_categories.id,
            iot_planner_categories.tenant,
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
            this.tenant,
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
    cte.tenant,
    cte.title,
    cte.description,
    cte.reference,
    cte.parent_id,
    cte.catnumber,
    cte.path
   FROM cte;


create or replace view "public"."iot_planner_categories_total_durations" as  SELECT sub.id,
    sub.tenant,
    sub.parent_id,
    sub.totalduration
   FROM ( WITH RECURSIVE cte AS (
                 SELECT durations.id,
                    durations.tenant,
                    durations.parent_id,
                    durations.totalduration
                   FROM durations
                UNION ALL
                 SELECT this.id,
                    this.tenant,
                    this.parent_id,
                    this.totalduration
                   FROM (durations this
                     JOIN cte prior ON (((prior.parent_id)::text = (this.id)::text)))
                )
         SELECT cte.id,
            cte.tenant,
            cte.parent_id,
            sum(cte.totalduration) AS totalduration
           FROM cte
          GROUP BY cte.id, cte.tenant, cte.parent_id) sub;


create or replace view "public"."iot_planner_categoriesaggr" as  SELECT cte.id,
    cte.tenant,
    cte.title,
    cte.description,
    cte.reference,
    cte.parent_id,
    cte.catnumber,
    cte.path,
    (dur.totalduration)::integer AS totalduration
   FROM (iot_planner_categories_cte cte
     LEFT JOIN iot_planner_categories_total_durations dur ON (((cte.id)::text = (dur.id)::text)));


create or replace view "public"."iot_planner_my_categories" as  SELECT sub.id,
    sub.tenant,
    sub.title,
    sub.description,
    sub.reference,
    sub.parent_id,
    sub.catnumber,
    sub.path,
    sub.user_userprincipalname
   FROM ( WITH RECURSIVE childrencte AS (
                 SELECT cat.id,
                    cat.tenant,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.tenant,
                    this.parent_id,
                    parent.user_userprincipalname
                   FROM (childrencte parent
                     JOIN iot_planner_categories this ON (((this.parent_id)::text = (parent.id)::text)))
                ), parentcte AS (
                 SELECT cat.id,
                    cat.tenant,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.tenant,
                    this.parent_id,
                    children.user_userprincipalname
                   FROM (parentcte children
                     JOIN iot_planner_categories this ON (((children.parent_id)::text = (this.id)::text)))
                ), pathcte AS (
                 SELECT iot_planner_categories_cte.id,
                    iot_planner_categories_cte.tenant,
                    iot_planner_categories_cte.title,
                    iot_planner_categories_cte.description,
                    iot_planner_categories_cte.reference,
                    iot_planner_categories_cte.parent_id,
                    iot_planner_categories_cte.catnumber,
                    iot_planner_categories_cte.path
                   FROM iot_planner_categories_cte
                )
         SELECT pathcte.id,
            pathcte.tenant,
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
            pathcte.tenant,
            pathcte.title,
            pathcte.description,
            pathcte.reference,
            pathcte.parent_id,
            pathcte.catnumber,
            pathcte.path,
            parentcte.user_userprincipalname
           FROM (pathcte
             JOIN parentcte ON (((pathcte.id)::text = (parentcte.id)::text)))) sub;


create or replace view "public"."iot_planner_my_categories_with_tags" as  SELECT cat.id,
    cat.tenant,
    cat.title,
    cat.description,
    cat.reference,
    cat.parent_id,
    cat.catnumber,
    cat.path,
    cat.user_userprincipalname,
    string_agg((t2c.tag_title)::text, ' '::text) AS tags
   FROM (iot_planner_my_categories cat
     LEFT JOIN iot_planner_tags2categories t2c ON (((cat.id)::text = (t2c.category_id)::text)))
  GROUP BY cat.id, cat.title, cat.tenant, cat.parent_id, cat.description, cat.reference, cat.path, cat.catnumber, cat.user_userprincipalname;


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


create or replace view "public"."adminservice_categoriesaggr" as  SELECT categoriesaggr_0.id,
    categoriesaggr_0.tenant,
    categoriesaggr_0.title,
    categoriesaggr_0.description,
    categoriesaggr_0.reference,
    categoriesaggr_0.parent_id,
    categoriesaggr_0.catnumber,
    categoriesaggr_0.path,
    categoriesaggr_0.totalduration
   FROM iot_planner_categoriesaggr categoriesaggr_0;



