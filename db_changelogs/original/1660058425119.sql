drop view if exists "public"."adminservice_categories";

drop view if exists "public"."iot_planner_my_categories";

drop view if exists "public"."iot_planner_my_categories_with_tags";

drop view if exists "public"."timetrackingservice_categories";

drop view if exists "public"."timetrackingservice_mycategories";

drop view if exists "public"."workitemsservice_iotworkitems";

drop view if exists "public"."workitemsservice_workitems";

drop view if exists "public"."iot_planner_hierarchies_hierarchies";

alter table "public"."iot_planner_categories" drop column "friendlyid";

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
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


create or replace view "public"."iot_planner_hierarchies_hierarchies" as  SELECT categories_0.id,
    categories_0.tenant,
        CASE categories_0.hierarchylevel
            WHEN 0 THEN categories_0.id
            WHEN 1 THEN parent_1.id
            WHEN 2 THEN parent_2.id
            WHEN 3 THEN parent_3.id
            ELSE NULL::character varying
        END AS level0,
        CASE categories_0.hierarchylevel
            WHEN 1 THEN categories_0.id
            WHEN 2 THEN parent_1.id
            WHEN 3 THEN parent_2.id
            ELSE NULL::character varying
        END AS level1,
        CASE categories_0.hierarchylevel
            WHEN 2 THEN categories_0.id
            WHEN 3 THEN parent_1.id
            ELSE NULL::character varying
        END AS level2,
        CASE categories_0.hierarchylevel
            WHEN 3 THEN categories_0.id
            ELSE NULL::character varying
        END AS level3,
        CASE categories_0.hierarchylevel
            WHEN 0 THEN categories_0.title
            WHEN 1 THEN parent_1.title
            WHEN 2 THEN parent_2.title
            WHEN 3 THEN parent_3.title
            ELSE NULL::character varying
        END AS level0title,
        CASE categories_0.hierarchylevel
            WHEN 1 THEN categories_0.title
            WHEN 2 THEN parent_1.title
            WHEN 3 THEN parent_2.title
            ELSE NULL::character varying
        END AS level1title,
        CASE categories_0.hierarchylevel
            WHEN 2 THEN categories_0.title
            WHEN 3 THEN parent_1.title
            ELSE NULL::character varying
        END AS level2title,
        CASE categories_0.hierarchylevel
            WHEN 3 THEN categories_0.title
            ELSE NULL::character varying
        END AS level3title,
        CASE categories_0.hierarchylevel
            WHEN 0 THEN categories_0.mappingid
            WHEN 1 THEN parent_1.mappingid
            WHEN 2 THEN parent_2.mappingid
            WHEN 3 THEN parent_3.mappingid
            ELSE NULL::character varying
        END AS level0mappingid,
        CASE categories_0.hierarchylevel
            WHEN 1 THEN categories_0.mappingid
            WHEN 2 THEN parent_1.mappingid
            WHEN 3 THEN parent_2.mappingid
            ELSE NULL::character varying
        END AS level1mappingid,
        CASE categories_0.hierarchylevel
            WHEN 2 THEN categories_0.mappingid
            WHEN 3 THEN parent_1.mappingid
            ELSE NULL::character varying
        END AS level2mappingid,
        CASE categories_0.hierarchylevel
            WHEN 3 THEN categories_0.mappingid
            ELSE NULL::character varying
        END AS level3mappingid
   FROM (((iot_planner_categories categories_0
     LEFT JOIN iot_planner_categories parent_1 ON (((categories_0.parent_id)::text = (parent_1.id)::text)))
     LEFT JOIN iot_planner_categories parent_2 ON (((parent_1.parent_id)::text = (parent_2.id)::text)))
     LEFT JOIN iot_planner_categories parent_3 ON (((parent_2.parent_id)::text = (parent_3.id)::text)));


create or replace view "public"."iot_planner_my_categories" as  SELECT sub.id,
    sub.title,
    sub.description,
    sub.reference,
    sub.parent_id,
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
                    cat.title AS path
                   FROM iot_planner_categories cat
                  WHERE (cat.parent_id IS NULL)
                UNION
                 SELECT this.id,
                    this.title,
                    this.description,
                    this.reference,
                    this.parent_id,
                    ((((prior.path)::text || ' > '::text) || (this.title)::text))::character varying(5000) AS path
                   FROM (pathcte prior
                     JOIN iot_planner_categories this ON (((this.parent_id)::text = (prior.id)::text)))
                )
         SELECT pathcte.id,
            pathcte.title,
            pathcte.description,
            pathcte.reference,
            pathcte.parent_id,
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
            pathcte.path,
            parentcte.user_userprincipalname
           FROM (pathcte
             JOIN parentcte ON (((pathcte.id)::text = (parentcte.id)::text)))) sub;


create or replace view "public"."iot_planner_my_categories_with_tags" as  SELECT sub.id,
    sub.title,
    sub.description,
    sub.reference,
    sub.parent_id,
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
                    cat.title AS path
                   FROM iot_planner_categories cat
                  WHERE (cat.parent_id IS NULL)
                UNION
                 SELECT this.id,
                    this.title,
                    this.description,
                    this.reference,
                    this.parent_id,
                    ((((prior.path)::text || ' > '::text) || (this.title)::text))::character varying(5000) AS path
                   FROM (pathcte prior
                     JOIN iot_planner_categories this ON (((this.parent_id)::text = (prior.id)::text)))
                )
         SELECT pathcte.id,
            pathcte.title,
            pathcte.description,
            pathcte.reference,
            pathcte.parent_id,
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
            pathcte.path,
            parentcte.user_userprincipalname
           FROM (pathcte
             JOIN parentcte ON (((pathcte.id)::text = (parentcte.id)::text)))) sub
     LEFT JOIN iot_planner_tags2categories t2c ON (((sub.id)::text = (t2c.category_id)::text)))
  GROUP BY sub.id, sub.title, sub.parent_id, sub.description, sub.reference, sub.path, sub.user_userprincipalname;


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
     LEFT JOIN iot_planner_hierarchies_hierarchies hierarchy_1 ON (((workitems_0.parent_id)::text = (hierarchy_1.id)::text)))
     LEFT JOIN iot_planner_users assignedto_2 ON (((workitems_0.assignedto_userprincipalname)::text = (assignedto_2.userprincipalname)::text)))
  WHERE (workitems_0.deleted IS NULL);


create or replace view "public"."workitemsservice_workitems" as  SELECT workitems_0.createdat,
    workitems_0.createdby,
    workitems_0.modifiedat,
    workitems_0.modifiedby,
    workitems_0.invoicerelevance,
    workitems_0.bonusrelevance,
    workitems_0.tenant,
    workitems_0.id,
    workitems_0.activateddate,
    workitems_0.activateddatemonth,
    workitems_0.activateddateyear,
    workitems_0.activateddateday,
    workitems_0.completeddate,
    workitems_0.completeddatemonth,
    workitems_0.completeddateyear,
    workitems_0.completeddateday,
    workitems_0.assignedto_userprincipalname,
    workitems_0.changeddate,
    workitems_0.assignedtoname,
    workitems_0.createddate,
    workitems_0.reason,
    workitems_0.state,
    workitems_0.teamproject,
    workitems_0.title,
    workitems_0.workitemtype,
    workitems_0.completedwork,
    workitems_0.remainingwork,
    workitems_0.originalestimate,
    workitems_0.resolveddate,
    workitems_0.closeddate,
    workitems_0.customer_friendlyid,
    workitems_0.customername,
    workitems_0.private,
    workitems_0.isallday,
    workitems_0.project_friendlyid,
    workitems_0.projecttitle,
    workitems_0.ticket,
    workitems_0.type,
    workitems_0.duration,
    workitems_0.resetentry,
    workitems_0.deleted,
    workitems_0.confirmed,
    workitems_0.parent_id,
    workitems_0.parentpath,
    assignedto_1.userprincipalname AS assignedtouserprincipalname,
    assignedto_1.manager_userprincipalname AS manageruserprincipalname,
    hierarchy_2.level0 AS customer,
    hierarchy_2.level1 AS project,
    hierarchy_2.level2 AS subproject,
    hierarchy_2.level3 AS workpackage,
    hierarchy_2.level0title AS customertext,
    hierarchy_2.level1title AS projecttext,
    hierarchy_2.level2title AS subprojecttext,
    hierarchy_2.level3title AS workpackagetext
   FROM ((iot_planner_workitems workitems_0
     LEFT JOIN iot_planner_users assignedto_1 ON (((workitems_0.assignedto_userprincipalname)::text = (assignedto_1.userprincipalname)::text)))
     LEFT JOIN iot_planner_hierarchies_hierarchies hierarchy_2 ON (((workitems_0.parent_id)::text = (hierarchy_2.id)::text)))
  WHERE (workitems_0.deleted IS NULL);


create or replace view "public"."workitemsservice_hierarchies" as  SELECT hierarchies_0.id,
    hierarchies_0.tenant,
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



