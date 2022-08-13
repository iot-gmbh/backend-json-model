drop function if exists "public"."get_durations"(p_username character varying, p_date_from character varying, p_date_until character varying);

drop function if exists "public"."get_durations"(p_username character varying, p_date_from timestamp with time zone, p_date_until timestamp with time zone);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_durations(p_username character varying, p_date_from timestamp with time zone, p_date_until timestamp with time zone)
 RETURNS TABLE(id character varying, parent_id character varying, title character varying, totalduration numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    cat.ID,
    cat.parent_ID,
    cat.title,
    sum(wi.duration) as totalDuration
FROM
    iot_planner_categories as cat
    LEFT OUTER JOIN iot_planner_workitems as wi on wi.parent_ID = cat.ID
    and wi.assignedTo_userPrincipalName = p_username
    and wi.activateddate > p_date_from
    and wi.activateddate < p_date_until
GROUP BY
    cat.ID,
    cat.parent_ID,
    cat.title;

end

$function$
;

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



