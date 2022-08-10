create or replace view "public"."analyticsservice_categories" as  SELECT categories_0.id,
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
   FROM workitemsservice_categories categories_0;


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


create or replace view "public"."analyticsservice_workitems" as  SELECT workitems_0.id,
    assignedto_1.displayname AS assignedtoname,
    parent_2.title AS parenttitle,
    workitems_0.activateddate,
    workitems_0.completeddate,
    workitems_0.activateddatemonth,
    workitems_0.activateddateyear,
    round(workitems_0.duration, 2) AS duration,
    workitems_0.parent_id,
    workitems_0.assignedto_userprincipalname
   FROM ((workitemsservice_workitems workitems_0
     LEFT JOIN workitemsservice_users assignedto_1 ON (((workitems_0.assignedto_userprincipalname)::text = (assignedto_1.userprincipalname)::text)))
     LEFT JOIN workitemsservice_categories parent_2 ON (((workitems_0.parent_id)::text = (parent_2.id)::text)))
  WHERE (workitems_0.deleted IS NULL);


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



