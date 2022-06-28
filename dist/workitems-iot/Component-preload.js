//@ui5-bundle iot/planner/iotworkitems/Component-preload.js
jQuery.sap.registerPreloadedModules({
  version: "2.0",
  modules: {
    "iot/planner/iotworkitems/Component.js": function () {
      sap.ui.define(["sap/fe/core/AppComponent"], function (e) {
        "use strict";
        return e.extend("iot.planner.workitems.Component", {
          metadata: { manifest: "json" },
        });
      });
    },
    "iot/planner/iotworkitems/i18n/i18n.properties":
      "# This is the resource bundle for workitems\r\n\r\n#Texts for manifest.json\r\n\r\n#XTIT: Application name\r\nappTitle=Display IOT Work Items\r\nappSubtitle=Find & Display\r\n\r\n#YDES: Application description\r\nappDescription=Find and display IOT Work Items\r\n",
    "iot/planner/iotworkitems/manifest.json":
      '{"_version":"1.29.0","sap.cloud":{"public":true,"service":"iot.project.planner"},"sap.app":{"id":"iot.planner.iotworkitems","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.0"},"title":"{{appTitle}}","description":"{{appDescription}}","dataSources":{"mainService":{"uri":"/work-items/","type":"OData","settings":{"odataVersion":"4.0"}}},"offline":false,"resources":"resources.json","sourceTemplate":{"id":"ui5template.fiorielements.v4.lrop","version":"1.0.0"},"crossNavigation":{"inbounds":{"iot-workitems-inbound":{"signature":{"parameters":{},"additionalParameters":"allowed"},"semanticObject":"IOTWorkItems","action":"display","title":"{{appTitle}}","subTitle":"{{appSubtitle}}","icon":"sap-icon://clinical-tast-tracker","--indicatorDataSource":{"dataSource":"mainService","path":"IOTWorkItems/$count","refresh":120}}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"resources":{"js":[],"css":[]},"dependencies":{"minUI5Version":"1.76.0","libs":{"sap.ui.core":{},"sap.fe.templates":{}}},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"},"":{"dataSource":"mainService","preload":true,"settings":{"synchronizationMode":"None","operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}}},"routing":{"routes":[{"pattern":":?query:","name":"WorkItemsList","target":"WorkItemsList"},{"pattern":"IOTWorkItems({key}):?query:","name":"WorkItemsObjectPage","target":"WorkItemsObjectPage"}],"targets":{"WorkItemsList":{"type":"Component","id":"WorkItemsList","name":"sap.fe.templates.ListReport","options":{"settings":{"entitySet":"IOTWorkItems","variantManagement":"Page","navigation":{"IOTWorkItems":{"detail":{"route":"WorkItemsObjectPage"}}}}}},"WorkItemsObjectPage":{"type":"Component","id":"WorkItemsObjectPage","name":"sap.fe.templates.ObjectPage","options":{"settings":{"entitySet":"IOTWorkItems"}}}}},"contentDensities":{"compact":true,"cozy":true}},"sap.platform.abap":{"_version":"1.1.0","uri":""},"sap.platform.hcp":{"_version":"1.1.0","uri":""},"sap.fiori":{"_version":"1.1.0","registrationIds":[],"archeType":"transactional"}}',
  },
});
