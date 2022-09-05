create or replace view "public"."iot_planner_categoriescumulativedurations" as  SELECT categories_0.id,
    categories_0.tenant,
    categories_0.parent_id,
    categories_0.title,
    '2021-05-02 14:55:08.091+02'::timestamp with time zone AS activateddate,
    '2021-05-02 14:55:08.091+02'::timestamp with time zone AS completeddate,
    ''::character varying(5000) AS assignedto_userprincipalname,
    categories_0.totalduration
   FROM iot_planner_categories categories_0;



