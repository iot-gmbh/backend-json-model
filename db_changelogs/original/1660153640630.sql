drop view if exists "public"."adminservice_workitems";

drop view if exists "public"."azuredevopsservice_workitems";

drop view if exists "public"."timetrackingservice_myworkitems";

drop view if exists "public"."workitemsservice_iotworkitems";

drop view if exists "public"."workitemsservice_workitems";

alter table "public"."iot_planner_workitems" drop column "customer_friendlyid";

alter table "public"."iot_planner_workitems" drop column "customername";

alter table "public"."iot_planner_workitems" drop column "project_friendlyid";

alter table "public"."iot_planner_workitems" drop column "projecttitle";

alter table "public"."iot_planner_workitems" drop column "ticket";

create or replace view "public"."adminservice_workitems" as  SELECT workitems_0.createdat,
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
    workitems_0.isallday,
    workitems_0.type,
    workitems_0.duration,
    workitems_0.resetentry,
    workitems_0.deleted,
    workitems_0.confirmed,
    workitems_0.parent_id,
    workitems_0.parentpath
   FROM iot_planner_workitems workitems_0;


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
    workitems_0.isallday,
    workitems_0.type,
    workitems_0.duration,
    workitems_0.resetentry,
    workitems_0.deleted,
    workitems_0.confirmed,
    workitems_0.parent_id,
    workitems_0.parentpath
   FROM iot_planner_workitems workitems_0;


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
    workitems_0.isallday,
    workitems_0.type,
    workitems_0.duration,
    workitems_0.resetentry,
    workitems_0.deleted,
    workitems_0.confirmed,
    workitems_0.parent_id,
    workitems_0.parentpath
   FROM iot_planner_workitems workitems_0;


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
    workitems_0.isallday,
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



