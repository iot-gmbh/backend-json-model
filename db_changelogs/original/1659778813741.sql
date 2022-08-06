drop view if exists "public"."iot_planner_my_categories";

drop view if exists "public"."iot_planner_my_categories_with_tags";

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



