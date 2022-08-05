create or replace view "public"."adminservice_users2categories" as  SELECT u2c_0.id,
    u2c_0.createdat,
    u2c_0.createdby,
    u2c_0.modifiedat,
    u2c_0.modifiedby,
    user_1.tenant,
    u2c_0.user_userprincipalname,
    u2c_0.category_id,
    user_1.userprincipalname,
    user_1.displayname,
    user_1.givenname,
    user_1.jobtitle,
    user_1.mail,
    user_1.mobilephone,
    user_1.officelocation,
    user_1.preferredlanguage,
    user_1.surname,
    user_1.manager_userprincipalname
   FROM (iot_planner_users2categories u2c_0
     JOIN iot_planner_users user_1 ON (((u2c_0.user_userprincipalname)::text = (user_1.userprincipalname)::text)));


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



