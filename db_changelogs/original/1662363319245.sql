create schema if not exists "public";

create table "public"."iot_planner_categories" (
    "id" character varying(36) not null,
    "createdat" timestamp with time zone,
    "createdby" character varying(255),
    "modifiedat" timestamp with time zone,
    "modifiedby" character varying(255),
    "invoicerelevance" numeric(2,1),
    "bonusrelevance" numeric(2,1),
    "tenant" character varying(5000),
    "title" character varying(5000),
    "description" character varying(5000),
    "absolutereference" character varying(5000),
    "mappingid" character varying(5000),
    "drilldownstate" character varying(5000) default 'expanded'::character varying,
    "path" character varying(5000),
    "hierarchylevel" character varying(5000),
    "shallowreference" character varying(5000),
    "deepreference" character varying(5000),
    "totalduration" numeric,
    "accumulatedduration" numeric,
    "relativeduration" numeric,
    "relativeaccduration" numeric,
    "grandtotal" numeric,
    "validfrom" timestamp with time zone,
    "validto" timestamp with time zone,
    "manager_userprincipalname" character varying(5000),
    "parent_id" character varying(36)
);


create table "public"."iot_planner_categorylevels" (
    "tenant" character varying(5000),
    "hierarchylevel" character varying(5000) not null,
    "title" character varying(5000)
);


create table "public"."iot_planner_tags" (
    "tenant" character varying(5000),
    "title" character varying(5000) not null,
    "category_id" character varying(36),
    "workitem_id" character varying(5000)
);


create table "public"."iot_planner_tags2categories" (
    "id" character varying(36) not null,
    "tenant" character varying(5000),
    "tag_title" character varying(5000),
    "category_id" character varying(36)
);


create table "public"."iot_planner_tags2workitems" (
    "id" character varying(36) not null,
    "tenant" character varying(5000),
    "tag_title" character varying(5000),
    "workitem_id" character varying(5000)
);


create table "public"."iot_planner_travels" (
    "id" character varying(36) not null,
    "createdat" timestamp with time zone,
    "createdby" character varying(255),
    "modifiedat" timestamp with time zone,
    "modifiedby" character varying(255),
    "tenant" character varying(5000),
    "user_userprincipalname" character varying(5000),
    "parent_id" character varying(36)
);


create table "public"."iot_planner_users" (
    "tenant" character varying(5000),
    "userprincipalname" character varying(5000) not null,
    "displayname" character varying(5000),
    "givenname" character varying(5000),
    "jobtitle" character varying(5000),
    "mail" character varying(5000),
    "mobilephone" character varying(5000),
    "officelocation" character varying(5000),
    "preferredlanguage" character varying(5000),
    "surname" character varying(5000),
    "manager_userprincipalname" character varying(5000)
);


create table "public"."iot_planner_users2categories" (
    "id" character varying(36) not null,
    "createdat" timestamp with time zone,
    "createdby" character varying(255),
    "modifiedat" timestamp with time zone,
    "modifiedby" character varying(255),
    "tenant" character varying(5000),
    "user_userprincipalname" character varying(5000),
    "category_id" character varying(36)
);


create table "public"."iot_planner_workitems" (
    "createdat" timestamp with time zone,
    "createdby" character varying(255),
    "modifiedat" timestamp with time zone,
    "modifiedby" character varying(255),
    "invoicerelevance" numeric(2,1),
    "bonusrelevance" numeric(2,1),
    "tenant" character varying(5000),
    "id" character varying(5000) not null,
    "activateddate" timestamp with time zone,
    "activateddatemonth" integer,
    "activateddateyear" integer,
    "activateddateday" integer,
    "completeddate" timestamp with time zone,
    "completeddatemonth" integer,
    "completeddateyear" integer,
    "completeddateday" integer,
    "assignedto_userprincipalname" character varying(5000),
    "changeddate" timestamp with time zone,
    "assignedtoname" character varying(5000),
    "createddate" timestamp with time zone,
    "reason" character varying(5000),
    "state" character varying(5000),
    "teamproject" character varying(5000),
    "title" character varying(5000),
    "workitemtype" character varying(5000),
    "completedwork" numeric,
    "remainingwork" numeric,
    "originalestimate" numeric,
    "resolveddate" timestamp with time zone,
    "closeddate" timestamp with time zone,
    "private" boolean,
    "isprivate" boolean,
    "isallday" boolean,
    "type" character varying(5000),
    "source" character varying(5000),
    "duration" numeric,
    "resetentry" boolean,
    "deleted" boolean,
    "confirmed" boolean,
    "parent_id" character varying(36),
    "parentpath" character varying(5000)
);


create table "public"."microsoft_graph_datetimetimezone" (
    "id" character varying(5000) not null,
    "datetime" text,
    "timezone" text
);


CREATE UNIQUE INDEX iot_planner_categories_id ON public.iot_planner_categories USING btree (id);

CREATE UNIQUE INDEX iot_planner_categorylevels_pkey ON public.iot_planner_categorylevels USING btree (hierarchylevel);

CREATE UNIQUE INDEX iot_planner_tags2categories_pkey ON public.iot_planner_tags2categories USING btree (id);

CREATE UNIQUE INDEX iot_planner_tags2workitems_pkey ON public.iot_planner_tags2workitems USING btree (id);

CREATE UNIQUE INDEX iot_planner_tags_pkey ON public.iot_planner_tags USING btree (title);

CREATE UNIQUE INDEX iot_planner_travels_pkey ON public.iot_planner_travels USING btree (id);

CREATE UNIQUE INDEX iot_planner_users2categories_pkey ON public.iot_planner_users2categories USING btree (id);

CREATE UNIQUE INDEX iot_planner_users_friendlyid ON public.iot_planner_users USING btree (userprincipalname);

CREATE UNIQUE INDEX iot_planner_workitems_pkey ON public.iot_planner_workitems USING btree (id);

CREATE UNIQUE INDEX microsoft_graph_datetimetimezone_pkey ON public.microsoft_graph_datetimetimezone USING btree (id);

alter table "public"."iot_planner_categories" add constraint "iot_planner_categories_id" PRIMARY KEY using index "iot_planner_categories_id";

alter table "public"."iot_planner_categorylevels" add constraint "iot_planner_categorylevels_pkey" PRIMARY KEY using index "iot_planner_categorylevels_pkey";

alter table "public"."iot_planner_tags" add constraint "iot_planner_tags_pkey" PRIMARY KEY using index "iot_planner_tags_pkey";

alter table "public"."iot_planner_tags2categories" add constraint "iot_planner_tags2categories_pkey" PRIMARY KEY using index "iot_planner_tags2categories_pkey";

alter table "public"."iot_planner_tags2workitems" add constraint "iot_planner_tags2workitems_pkey" PRIMARY KEY using index "iot_planner_tags2workitems_pkey";

alter table "public"."iot_planner_travels" add constraint "iot_planner_travels_pkey" PRIMARY KEY using index "iot_planner_travels_pkey";

alter table "public"."iot_planner_users" add constraint "iot_planner_users_friendlyid" PRIMARY KEY using index "iot_planner_users_friendlyid";

alter table "public"."iot_planner_users2categories" add constraint "iot_planner_users2categories_pkey" PRIMARY KEY using index "iot_planner_users2categories_pkey";

alter table "public"."iot_planner_workitems" add constraint "iot_planner_workitems_pkey" PRIMARY KEY using index "iot_planner_workitems_pkey";

alter table "public"."microsoft_graph_datetimetimezone" add constraint "microsoft_graph_datetimetimezone_pkey" PRIMARY KEY using index "microsoft_graph_datetimetimezone_pkey";

set check_function_bodies = off;

create or replace view "public"."azuredevopsservice_categories" as  SELECT categories_0.id,
    categories_0.createdat,
    categories_0.createdby,
    categories_0.modifiedat,
    categories_0.modifiedby,
    categories_0.invoicerelevance,
    categories_0.bonusrelevance,
    categories_0.tenant,
    categories_0.title,
    categories_0.description,
    categories_0.absolutereference,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.hierarchylevel,
    categories_0.shallowreference,
    categories_0.deepreference,
    categories_0.totalduration,
    categories_0.accumulatedduration,
    categories_0.relativeduration,
    categories_0.relativeaccduration,
    categories_0.grandtotal,
    categories_0.validfrom,
    categories_0.validto,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


create or replace view "public"."azuredevopsservice_tags2workitems" as  SELECT tags2workitems_0.id,
    tags2workitems_0.tenant,
    tags2workitems_0.tag_title,
    tags2workitems_0.workitem_id
   FROM iot_planner_tags2workitems tags2workitems_0;


create or replace view "public"."azuredevopsservice_workitems" as  SELECT workitems_0.createdat,
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
    workitems_0.private,
    workitems_0.isprivate,
    workitems_0.isallday,
    workitems_0.type,
    workitems_0.source,
    workitems_0.duration,
    workitems_0.resetentry,
    workitems_0.deleted,
    workitems_0.confirmed,
    workitems_0.parent_id,
    workitems_0.parentpath
   FROM iot_planner_workitems workitems_0;


create or replace view "public"."categoriesservice_categories" as  SELECT categories_0.id,
    categories_0.createdat,
    categories_0.createdby,
    categories_0.modifiedat,
    categories_0.modifiedby,
    categories_0.invoicerelevance,
    categories_0.bonusrelevance,
    categories_0.tenant,
    categories_0.title,
    categories_0.description,
    categories_0.absolutereference,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.hierarchylevel,
    categories_0.shallowreference,
    categories_0.deepreference,
    categories_0.totalduration,
    categories_0.accumulatedduration,
    categories_0.relativeduration,
    categories_0.relativeaccduration,
    categories_0.grandtotal,
    categories_0.validfrom,
    categories_0.validto,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


create or replace view "public"."categoriesservice_users" as  SELECT users_0.tenant,
    users_0.userprincipalname,
    users_0.displayname,
    users_0.givenname,
    users_0.jobtitle,
    users_0.mail,
    users_0.mobilephone,
    users_0.officelocation,
    users_0.preferredlanguage,
    users_0.surname,
    users_0.manager_userprincipalname
   FROM iot_planner_users users_0;


create or replace view "public"."categoriesservice_users2categories" as  SELECT users2categories_0.id,
    users2categories_0.createdat,
    users2categories_0.createdby,
    users2categories_0.modifiedat,
    users2categories_0.modifiedby,
    users2categories_0.tenant,
    users2categories_0.user_userprincipalname,
    users2categories_0.category_id,
    user_1.displayname
   FROM (iot_planner_users2categories users2categories_0
     LEFT JOIN iot_planner_users user_1 ON (((users2categories_0.user_userprincipalname)::text = (user_1.userprincipalname)::text)));


CREATE OR REPLACE FUNCTION public.get_categories(p_tenant character varying, p_root character varying DEFAULT NULL::character varying, p_valid_at timestamp with time zone DEFAULT now())
 RETURNS TABLE(id character varying, tenant character varying, parent_id character varying, title character varying, hierarchylevel character varying, description character varying, validfrom timestamp with time zone, validto timestamp with time zone, absolutereference character varying, shallowreference character varying, deepreference character varying, path character varying)
 LANGUAGE plpgsql
AS $function$ #variable_conflict use_column
begin RETURN QUERY WITH RECURSIVE cte AS (
    SELECT
        ID,
        tenant,
        parent_ID,
        title,
        hierarchyLevel,
        description,
        validFrom,
        validTo,
        absoluteReference,
        shallowReference,
        shallowReference as deepReference,
        title as path
    FROM
        iot_planner_Categories
    WHERE
        -- if p_root is null (=> in case you want to get all elements of level 0), then parent_ID = null will return no results => in this case check for "parent_ID IS NULL"
        tenant = p_tenant
        and validFrom <= p_valid_at
        and validTo > p_valid_at
        and (
            p_root is null
            and parent_ID is null
            or ID = p_root
        )
    UNION
    SELECT
        this.ID,
        this.tenant,
        this.parent_ID,
        this.title,
        this.hierarchyLevel,
        this.description,
        this.validFrom,
        this.validTo,
        this.absoluteReference,
        this.shallowReference,
        CAST(
            (prior.deepReference || '-' || this.shallowReference) as varchar(5000)
        ) as deepReference,
        CAST(
            (prior.path || ' > ' || this.title) as varchar(5000)
        ) as path
    FROM
        cte AS prior
        INNER JOIN iot_planner_Categories AS this ON this.parent_ID = prior.ID
        and this.tenant = p_tenant
        and this.validFrom <= p_valid_at
        and this.validTo > p_valid_at
)
SELECT
    cte.*
FROM
    cte;

end $function$
;

CREATE OR REPLACE FUNCTION public.get_cumulative_category_durations(p_tenant character varying, p_username character varying, p_date_from timestamp with time zone, p_date_until timestamp with time zone)
 RETURNS TABLE(id character varying, tenant character varying, parent_id character varying, title character varying, hierarchylevel character varying, totalduration numeric, accumulatedduration numeric)
 LANGUAGE plpgsql
AS $function$ #variable_conflict use_column
begin RETURN QUERY
/* for reference: https://stackoverflow.com/questions/26660189/recursive-query-with-sum-in-postgres */
WITH RECURSIVE cte AS (
    SELECT
        ID,
        ID as parent_ID,
        tenant,
        parent_ID as parent,
        title,
        hierarchyLevel,
        totalDuration,
        totalDuration as accumulatedDuration
    FROM
        get_durations(p_tenant, p_username, p_date_from, p_date_until)
    UNION
	ALL
    SELECT
        c.ID,
        d.ID,
        c.tenant,
        c.parent,
        c.title,
        c.hierarchyLevel,
        c.totalDuration,
        d.totalDuration as accumulatedDuration
    FROM
        cte c
        JOIN get_durations(p_tenant, p_username, p_date_from, p_date_until) d on c.parent_ID = d.parent_ID
)
SELECT
    ID,
    tenant,
    parent as parent_ID,
    title,
    hierarchyLevel,
    totalDuration,
    sum(accumulatedDuration) AS accumulatedDuration
FROM
    cte 
GROUP BY
    ID,
    tenant,
    parent,
    hierarchyLevel,
    totalDuration,
    title;

end $function$
;

CREATE OR REPLACE FUNCTION public.get_cumulative_category_durations_with_path(p_tenant character varying, p_username character varying, p_date_from timestamp with time zone, p_date_until timestamp with time zone)
 RETURNS TABLE(id character varying, tenant character varying, parent_id character varying, title character varying, hierarchylevel character varying, totalduration numeric, accumulatedduration numeric, deepreference character varying)
 LANGUAGE plpgsql
AS $function$ #variable_conflict use_column
begin RETURN QUERY
SELECT
    dur.ID,
    dur.tenant,
    dur.parent_ID,
    dur.title,
    dur.hierarchyLevel,
    dur.totalDuration,
    dur.accumulatedDuration,
    pathCTE.deepReference
FROM
    get_cumulative_category_durations(p_tenant, p_username, p_date_from, p_date_until) as dur
    JOIN iot_planner_categories_cte as pathCTE on pathCTE.ID = dur.ID;
end $function$
;

CREATE OR REPLACE FUNCTION public.get_durations(p_tenant character varying, p_username character varying, p_date_from timestamp with time zone, p_date_until timestamp with time zone)
 RETURNS TABLE(id character varying, tenant character varying, parent_id character varying, title character varying, hierarchylevel character varying, totalduration numeric, datefrom timestamp with time zone, dateuntil timestamp with time zone)
 LANGUAGE plpgsql
AS $function$ #variable_conflict use_column
begin RETURN QUERY
SELECT
    cat.ID,
    cat.tenant,
    cat.parent_ID,
    cat.title,
    cat.hierarchyLevel,
    sum(wi.duration) as totalDuration,
    p_date_from as dateFrom,
    p_date_until as dateUntil
FROM
    iot_planner_categories as cat
    LEFT OUTER JOIN iot_planner_workitems as wi on wi.parent_ID = cat.ID
    and wi.tenant = cat.tenant
    and wi.assignedTo_userPrincipalName ilike p_username
    and wi.activateddate > p_date_from
    and wi.activateddate < p_date_until
where
    cat.tenant = p_tenant
GROUP BY
    cat.ID,
    cat.tenant,
    cat.parent_ID,
    cat.title,
    cat.hierarchyLevel;

end $function$
;

create or replace view "public"."iot_planner_categories_cte" as  WITH RECURSIVE cte AS (
         SELECT iot_planner_categories.id,
            iot_planner_categories.tenant,
            iot_planner_categories.parent_id,
            iot_planner_categories.title,
            iot_planner_categories.hierarchylevel,
            iot_planner_categories.description,
            iot_planner_categories.validfrom,
            iot_planner_categories.validto,
            iot_planner_categories.absolutereference,
            iot_planner_categories.shallowreference,
            iot_planner_categories.shallowreference AS deepreference,
            iot_planner_categories.title AS path
           FROM iot_planner_categories
          WHERE (iot_planner_categories.parent_id IS NULL)
        UNION
         SELECT this.id,
            this.tenant,
            this.parent_id,
            this.title,
            this.hierarchylevel,
            this.description,
            this.validfrom,
            this.validto,
            this.absolutereference,
            this.shallowreference,
            ((((prior.deepreference)::text || '-'::text) || (this.shallowreference)::text))::character varying(5000) AS deepreference,
            ((((prior.path)::text || ' > '::text) || (this.title)::text))::character varying(5000) AS path
           FROM (cte prior
             JOIN iot_planner_categories this ON (((this.parent_id)::text = (prior.id)::text)))
        )
 SELECT cte.id,
    cte.tenant,
    cte.parent_id,
    cte.title,
    cte.hierarchylevel,
    cte.description,
    cte.validfrom,
    cte.validto,
    cte.absolutereference,
    cte.shallowreference,
    cte.deepreference,
    cte.path
   FROM cte;


create or replace view "public"."iot_planner_categoriescumulativedurations" as  SELECT categories_0.id,
    categories_0.tenant,
    categories_0.parent_id,
    categories_0.title,
    '2021-05-02 14:55:08.091+02'::timestamp with time zone AS activateddate,
    '2021-05-02 14:55:08.091+02'::timestamp with time zone AS completeddate,
    ''::character varying(5000) AS assignedto_userprincipalname,
    categories_0.totalduration
   FROM iot_planner_categories categories_0;


create or replace view "public"."iot_planner_categorytags" as  SELECT tags2categories_0.category_id AS categoryid,
    tags2categories_0.tenant,
    string_agg((tags2categories_0.tag_title)::text, ' '::text) AS tags
   FROM iot_planner_tags2categories tags2categories_0
  GROUP BY tags2categories_0.category_id, tags2categories_0.tenant;


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
    sub.tenant,
    sub.parent_id,
    sub.title,
    sub.hierarchylevel,
    sub.description,
    sub.validfrom,
    sub.validto,
    sub.absolutereference,
    sub.shallowreference,
    sub.deepreference,
    sub.path,
    sub.user_userprincipalname
   FROM ( WITH RECURSIVE childrencte AS (
                 SELECT cat.id,
                    cat.tenant,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                  WHERE ((cat.validfrom <= now()) AND (cat.validto > now()))
                UNION
                 SELECT this.id,
                    this.tenant,
                    this.parent_id,
                    parent.user_userprincipalname
                   FROM (childrencte parent
                     JOIN iot_planner_categories this ON ((((this.parent_id)::text = (parent.id)::text) AND (this.validfrom <= now()) AND (this.validto > now()))))
                ), parentcte AS (
                 SELECT cat.id,
                    cat.tenant,
                    cat.parent_id,
                    user2cat.user_userprincipalname
                   FROM (iot_planner_categories cat
                     JOIN iot_planner_users2categories user2cat ON (((cat.id)::text = (user2cat.category_id)::text)))
                  WHERE ((cat.validfrom <= now()) AND (cat.validto > now()))
                UNION
                 SELECT this.id,
                    this.tenant,
                    this.parent_id,
                    children.user_userprincipalname
                   FROM (parentcte children
                     JOIN iot_planner_categories this ON ((((children.parent_id)::text = (this.id)::text) AND (this.validfrom <= now()) AND (this.validto > now()))))
                )
         SELECT pathcte.id,
            pathcte.tenant,
            pathcte.parent_id,
            pathcte.title,
            pathcte.hierarchylevel,
            pathcte.description,
            pathcte.validfrom,
            pathcte.validto,
            pathcte.absolutereference,
            pathcte.shallowreference,
            pathcte.deepreference,
            pathcte.path,
            childrencte.user_userprincipalname
           FROM (iot_planner_categories_cte pathcte
             JOIN childrencte ON (((pathcte.id)::text = (childrencte.id)::text)))
        UNION
         SELECT pathcte.id,
            pathcte.tenant,
            pathcte.parent_id,
            pathcte.title,
            pathcte.hierarchylevel,
            pathcte.description,
            pathcte.validfrom,
            pathcte.validto,
            pathcte.absolutereference,
            pathcte.shallowreference,
            pathcte.deepreference,
            pathcte.path,
            parentcte.user_userprincipalname
           FROM (iot_planner_categories_cte pathcte
             JOIN parentcte ON (((pathcte.id)::text = (parentcte.id)::text)))) sub;


create or replace view "public"."iot_planner_my_categories_with_tags" as  SELECT cat.id,
    cat.tenant,
    cat.parent_id,
    cat.title,
    cat.hierarchylevel,
    cat.description,
    cat.validfrom,
    cat.validto,
    cat.absolutereference,
    cat.shallowreference,
    cat.deepreference,
    cat.path,
    cat.user_userprincipalname,
    string_agg((t2c.tag_title)::text, ' '::text) AS tags
   FROM (iot_planner_my_categories cat
     LEFT JOIN iot_planner_tags2categories t2c ON (((cat.id)::text = (t2c.category_id)::text)))
  GROUP BY cat.id, cat.title, cat.tenant, cat.parent_id, cat.hierarchylevel, cat.validfrom, cat.validto, cat.description, cat.absolutereference, cat.path, cat.deepreference, cat.shallowreference, cat.user_userprincipalname;


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
    categories_0.absolutereference,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.hierarchylevel,
    categories_0.shallowreference,
    categories_0.deepreference,
    categories_0.totalduration,
    categories_0.accumulatedduration,
    categories_0.relativeduration,
    categories_0.relativeaccduration,
    categories_0.grandtotal,
    categories_0.validfrom,
    categories_0.validto,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


create or replace view "public"."timetrackingservice_categorylevels" as  SELECT categorylevels_0.tenant,
    categorylevels_0.hierarchylevel,
    categorylevels_0.title
   FROM iot_planner_categorylevels categorylevels_0;


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
    categories_0.absolutereference,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.hierarchylevel,
    categories_0.shallowreference,
    categories_0.deepreference,
    categories_0.totalduration,
    categories_0.accumulatedduration,
    categories_0.relativeduration,
    categories_0.relativeaccduration,
    categories_0.grandtotal,
    categories_0.validfrom,
    categories_0.validto,
    categories_0.manager_userprincipalname,
    categories_0.parent_id
   FROM iot_planner_categories categories_0;


create or replace view "public"."timetrackingservice_myuser" as  SELECT users_0.tenant,
    users_0.userprincipalname,
    users_0.displayname,
    users_0.givenname,
    users_0.jobtitle,
    users_0.mail,
    users_0.mobilephone,
    users_0.officelocation,
    users_0.preferredlanguage,
    users_0.surname,
    users_0.manager_userprincipalname
   FROM iot_planner_users users_0;


create or replace view "public"."timetrackingservice_myworkitems" as  SELECT workitems_0.createdat,
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
    workitems_0.private,
    workitems_0.isprivate,
    workitems_0.isallday,
    workitems_0.type,
    workitems_0.source,
    workitems_0.duration,
    workitems_0.resetentry,
    workitems_0.deleted,
    workitems_0.confirmed,
    workitems_0.parent_id,
    workitems_0.parentpath
   FROM iot_planner_workitems workitems_0;


create or replace view "public"."timetrackingservice_tags" as  SELECT tags_0.tenant,
    tags_0.title,
    tags_0.category_id,
    tags_0.workitem_id
   FROM iot_planner_tags tags_0;


create or replace view "public"."timetrackingservice_tags2categories" as  SELECT tags2categories_0.id,
    tags2categories_0.tenant,
    tags2categories_0.tag_title,
    tags2categories_0.category_id
   FROM iot_planner_tags2categories tags2categories_0;


create or replace view "public"."timetrackingservice_tags2workitems" as  SELECT tags2workitems_0.id,
    tags2workitems_0.tenant,
    tags2workitems_0.tag_title,
    tags2workitems_0.workitem_id
   FROM iot_planner_tags2workitems tags2workitems_0;


create or replace view "public"."timetrackingservice_users2categories" as  SELECT users2categories_0.id,
    users2categories_0.createdat,
    users2categories_0.createdby,
    users2categories_0.modifiedat,
    users2categories_0.modifiedby,
    users2categories_0.tenant,
    users2categories_0.user_userprincipalname,
    users2categories_0.category_id
   FROM iot_planner_users2categories users2categories_0;


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
    categories_0.absolutereference,
    categories_0.mappingid,
    categories_0.drilldownstate,
    categories_0.path,
    categories_0.hierarchylevel,
    categories_0.shallowreference,
    categories_0.deepreference,
    categories_0.totalduration,
    categories_0.accumulatedduration,
    categories_0.relativeduration,
    categories_0.relativeaccduration,
    categories_0.grandtotal,
    categories_0.validfrom,
    categories_0.validto,
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


create or replace view "public"."workitemsservice_tags2workitems" as  SELECT tags2workitems_0.id,
    tags2workitems_0.tenant,
    tags2workitems_0.tag_title,
    tags2workitems_0.workitem_id
   FROM iot_planner_tags2workitems tags2workitems_0;


create or replace view "public"."workitemsservice_users" as  SELECT users_0.tenant,
    users_0.userprincipalname,
    users_0.displayname,
    users_0.givenname,
    users_0.jobtitle,
    users_0.mail,
    users_0.mobilephone,
    users_0.officelocation,
    users_0.preferredlanguage,
    users_0.surname,
    users_0.manager_userprincipalname
   FROM iot_planner_users users_0;


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
    workitems_0.private,
    workitems_0.isprivate,
    workitems_0.isallday,
    workitems_0.type,
    workitems_0.source,
    workitems_0.duration,
    workitems_0.resetentry,
    workitems_0.deleted,
    workitems_0.confirmed,
    workitems_0.parent_id,
    workitems_0.parentpath,
    assignedto_1.userprincipalname AS assignedtouserprincipalname,
    assignedto_1.manager_userprincipalname AS manageruserprincipalname
   FROM (iot_planner_workitems workitems_0
     LEFT JOIN iot_planner_users assignedto_1 ON (((workitems_0.assignedto_userprincipalname)::text = (assignedto_1.userprincipalname)::text)))
  WHERE (workitems_0.deleted IS NULL);


create or replace view "public"."analyticsservice_categories" as  SELECT wi_0.id,
    wi_0.assignedtouserprincipalname,
    wi_0.activateddate,
    wi_0.completeddate,
    wi_0.activateddatemonth,
    wi_0.activateddateyear,
    wi_0.duration,
    wi_0.title AS parenttitle,
    ''::text AS parent,
    wi_0.assignedto_userprincipalname,
    'expanded'::text AS drilldownstate,
    ''::text AS hierarchylevel,
    wi_0.tenant
   FROM workitemsservice_workitems wi_0
  WHERE (wi_0.deleted IS NULL);


create or replace view "public"."analyticsservice_users" as  SELECT users_0.tenant,
    users_0.userprincipalname,
    users_0.displayname,
    users_0.givenname,
    users_0.jobtitle,
    users_0.mail,
    users_0.mobilephone,
    users_0.officelocation,
    users_0.preferredlanguage,
    users_0.surname,
    users_0.manager_userprincipalname
   FROM workitemsservice_users users_0;


create or replace view "public"."azuredevopsservice_hierarchies" as  SELECT hierarchies_0.id,
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



