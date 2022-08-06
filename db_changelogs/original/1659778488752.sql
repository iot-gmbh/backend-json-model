drop view if exists "public"."adminservice_categories";

drop view if exists "public"."iot_planner_my_categories";

drop view if exists "public"."iot_planner_my_categories_with_tags";

drop view if exists "public"."timetrackingservice_categories";

drop view if exists "public"."timetrackingservice_mycategories";

drop view if exists "public"."workitemsservice_iotworkitems";

drop view if exists "public"."iot_planner_hierarchies_hierarchies";

alter table "public"."iot_planner_categories" add column "reference" character varying(5000);

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
    categories_0.hierarchylevel,
    categories_0.friendlyid,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


create or replace view "public"."iot_planner_hierarchies_hierarchies" as  SELECT parent_0.id AS parent,
        CASE parent_0.hierarchylevel
            WHEN 0 THEN parent_0.id
            WHEN 1 THEN grandparent_1.id
            WHEN 2 THEN greatgrandparent_2.id
            ELSE greatgreatgrandparent_3.id
        END AS level0,
        CASE parent_0.hierarchylevel
            WHEN 0 THEN parent_0.mappingid
            WHEN 1 THEN grandparent_1.mappingid
            WHEN 2 THEN greatgrandparent_2.mappingid
            ELSE greatgreatgrandparent_3.mappingid
        END AS level0mappingid,
        CASE parent_0.hierarchylevel
            WHEN 1 THEN parent_0.id
            WHEN 2 THEN grandparent_1.id
            WHEN 3 THEN greatgrandparent_2.id
            ELSE greatgreatgrandparent_3.id
        END AS level1,
        CASE parent_0.hierarchylevel
            WHEN 1 THEN parent_0.mappingid
            WHEN 2 THEN grandparent_1.mappingid
            WHEN 3 THEN greatgrandparent_2.mappingid
            ELSE greatgreatgrandparent_3.mappingid
        END AS level1mappingid,
        CASE parent_0.hierarchylevel
            WHEN 2 THEN parent_0.id
            WHEN 3 THEN grandparent_1.id
            ELSE greatgrandparent_2.id
        END AS level2,
        CASE parent_0.hierarchylevel
            WHEN 2 THEN parent_0.mappingid
            WHEN 3 THEN grandparent_1.mappingid
            ELSE greatgrandparent_2.mappingid
        END AS level2mappingid,
        CASE parent_0.hierarchylevel
            WHEN 3 THEN parent_0.id
            ELSE grandparent_1.id
        END AS level3,
        CASE parent_0.hierarchylevel
            WHEN 3 THEN parent_0.mappingid
            ELSE grandparent_1.mappingid
        END AS level3mappingid
   FROM (((iot_planner_categories parent_0
     LEFT JOIN iot_planner_categories grandparent_1 ON (((parent_0.parent_id)::text = (grandparent_1.id)::text)))
     LEFT JOIN iot_planner_categories greatgrandparent_2 ON (((grandparent_1.parent_id)::text = (greatgrandparent_2.id)::text)))
     LEFT JOIN iot_planner_categories greatgreatgrandparent_3 ON (((greatgrandparent_2.parent_id)::text = (greatgreatgrandparent_3.id)::text)));


create or replace view "public"."iot_planner_my_categories" as  SELECT sub.id,
    sub.title,
    sub.parent_id,
    sub.path,
    sub.user_userprincipalname
   FROM ( WITH RECURSIVE childrencte AS (
                 SELECT cat.id,
                    cat.title,
                    cat.description,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.title,
                    this.description,
                    this.parent_id,
                    parent.user_userprincipalname
                   FROM (childrencte parent
                     JOIN iot_planner_categories this ON (((this.parent_id)::text = (parent.id)::text)))
                ), parentcte AS (
                 SELECT cat.id,
                    cat.title,
                    cat.description,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.title,
                    this.description,
                    this.parent_id,
                    children.user_userprincipalname
                   FROM (parentcte children
                     JOIN iot_planner_categories this ON (((children.parent_id)::text = (this.id)::text)))
                ), pathcte AS (
                 SELECT cat.id,
                    cat.title,
                    cat.parent_id,
                    cat.title AS path
                   FROM iot_planner_categories cat
                  WHERE (cat.parent_id IS NULL)
                UNION
                 SELECT this.id,
                    this.title,
                    this.parent_id,
                    ((((prior.path)::text || ' > '::text) || (this.title)::text))::character varying(5000) AS path
                   FROM (pathcte prior
                     JOIN iot_planner_categories this ON (((this.parent_id)::text = (prior.id)::text)))
                )
         SELECT pathcte.id,
            pathcte.title,
            pathcte.parent_id,
            pathcte.path,
            childrencte.user_userprincipalname
           FROM (pathcte
             JOIN childrencte ON (((pathcte.id)::text = (childrencte.id)::text)))
        UNION
         SELECT pathcte.id,
            pathcte.title,
            pathcte.parent_id,
            pathcte.path,
            parentcte.user_userprincipalname
           FROM (pathcte
             JOIN parentcte ON (((pathcte.id)::text = (parentcte.id)::text)))) sub;


create or replace view "public"."iot_planner_my_categories_with_tags" as  SELECT sub.id,
    sub.title,
    sub.parent_id,
    sub.path,
    sub.user_userprincipalname,
    string_agg((t2c.tag_title)::text, ' '::text) AS tags
   FROM (( WITH RECURSIVE childrencte AS (
                 SELECT cat.id,
                    cat.title,
                    cat.description,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.title,
                    this.description,
                    this.parent_id,
                    parent.user_userprincipalname
                   FROM (childrencte parent
                     JOIN iot_planner_categories this ON (((this.parent_id)::text = (parent.id)::text)))
                ), parentcte AS (
                 SELECT cat.id,
                    cat.title,
                    cat.description,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                UNION
                 SELECT this.id,
                    this.title,
                    this.description,
                    this.parent_id,
                    children.user_userprincipalname
                   FROM (parentcte children
                     JOIN iot_planner_categories this ON (((children.parent_id)::text = (this.id)::text)))
                ), pathcte AS (
                 SELECT cat.id,
                    cat.title,
                    cat.parent_id,
                    cat.title AS path
                   FROM iot_planner_categories cat
                  WHERE (cat.parent_id IS NULL)
                UNION
                 SELECT this.id,
                    this.title,
                    this.parent_id,
                    ((((prior.path)::text || ' > '::text) || (this.title)::text))::character varying(5000) AS path
                   FROM (pathcte prior
                     JOIN iot_planner_categories this ON (((this.parent_id)::text = (prior.id)::text)))
                )
         SELECT pathcte.id,
            pathcte.title,
            pathcte.parent_id,
            pathcte.path,
            childrencte.user_userprincipalname
           FROM (pathcte
             JOIN childrencte ON (((pathcte.id)::text = (childrencte.id)::text)))
        UNION
         SELECT pathcte.id,
            pathcte.title,
            pathcte.parent_id,
            pathcte.path,
            parentcte.user_userprincipalname
           FROM (pathcte
             JOIN parentcte ON (((pathcte.id)::text = (parentcte.id)::text)))) sub
     LEFT JOIN iot_planner_tags2categories t2c ON (((sub.id)::text = (t2c.category_id)::text)))
  GROUP BY sub.id, sub.title, sub.parent_id, sub.path, sub.user_userprincipalname;


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
    categories_0.hierarchylevel,
    categories_0.friendlyid,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
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
    categories_0.hierarchylevel,
    categories_0.friendlyid,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


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



