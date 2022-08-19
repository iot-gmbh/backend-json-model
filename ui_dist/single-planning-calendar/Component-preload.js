//@ui5-bundle iot/singleplanningcalendar/Component-preload.js
sap.ui.require.preload({
  "iot/singleplanningcalendar/Component.js": function () {
    sap.ui.define(
      [
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "iot/singleplanningcalendar/model/models",
      ],
      (e, i, n) =>
        e.extend("iot.singleplanningcalendar.Component", {
          metadata: { manifest: "json" },
          init() {
            e.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
            this.setModel(n.createDeviceModel(), "device");
          },
        })
    );
  },
  "iot/singleplanningcalendar/controller/BaseController.js": function () {
    sap.ui.define(
      ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
      (e, t) =>
        e.extend("iot.singleplanningcalendar.controller.BaseController", {
          getRouter() {
            return this.getOwnerComponent().getRouter();
          },
          getModel(e) {
            return this.getView().getModel(e);
          },
          setModel(e, t) {
            return this.getView().setModel(e, t);
          },
          getResourceBundle() {
            return this.getOwnerComponent()
              .getModel("i18n")
              .getResourceBundle();
          },
          async read({ path: e, ...t }) {
            return new Promise((r, a) => {
              this.getModel("OData").read(e, { ...t, success: r, error: a });
            });
          },
          async update({ path: e, data: t }) {
            return new Promise((r, a) => {
              this.getModel("OData").update(e, t, { success: r, error: a });
            });
          },
          async create({ path: e, data: t }) {
            return new Promise((r, a) => {
              this.getModel("OData").create(e, t, { success: r, error: a });
            });
          },
          async reset({ path: e, data: t }) {
            return new Promise((r, a) => {
              this.getModel("OData").update(
                e,
                { ...t, resetEntry: true },
                { success: r, error: a }
              );
            });
          },
          async remove({
            path: e,
            data: { ID: t, activatedDate: r, completedDate: a },
          }) {
            return new Promise((s, o) => {
              this.getModel("OData").update(
                e,
                { ID: t, activatedDate: r, completedDate: a, deleted: true },
                { success: s, error: o }
              );
            });
          },
          onNavBack() {
            const e = t.getInstance().getPreviousHash();
            if (e !== undefined) {
              history.go(-1);
            } else {
              this.getRouter().navTo("master", {}, true);
            }
          },
        })
    );
  },
  "iot/singleplanningcalendar/controller/ErrorParser.js":
    'function extractErrorMsgFromXML(r){const e=new DOMParser;const t=e.parseFromString(r,"text/xml");return t.getElementsByTagName("error")[0].getElementsByTagName("message")[0].childNodes[0].wholeText}function extractErrorMsgFromJSON(r){const e=JSON.parse(r.responseText);const t=e.error.message.value||"The error could not be parsed.";return t}function parseError(r){try{if(!r.responseText&&r.message)return r.message;return extractErrorMsgFromJSON(r)}catch(e){try{return extractErrorMsgFromXML(r)}catch(r){return"The error message could not be parsed."}}}sap.ui.define([],()=>({parse(r){const e=parseError(r);return e}}));',
  "iot/singleplanningcalendar/controller/SinglePlanningCalendar.controller.js":
    'const nest=(t,e=null,s="parent_ID")=>t.filter(t=>t[s]===e).map(e=>({...e,children:nest(t,e.ID)}));const capitalizeFirstLetter=t=>t.charAt(0).toUpperCase()+t.slice(1);sap.ui.define(["./BaseController","./ErrorParser","sap/ui/model/Filter","../model/formatter","sap/ui/model/json/JSONModel","../model/legendItems","sap/m/MessageBox","sap/m/MessageToast"],(t,e,s,a,n,o,r,i)=>{function c(t,e){const s=new Date(t);s.setDate(s.getDate()+e);return s}function l(){const t=new Date((new Date).setHours(0,0,0,1));const e=t.getDay();const s=t.getDate()-e+(e===0?-6:1);return new Date(t.setDate(s))}return t.extend("iot.singleplanningcalendar.controller.SinglePlanningCalendar",{formatter:a,async onInit(){const t=this.getResourceBundle();const s=this.byId("SPCalendar");const a=s.getViews()[1];const c=new n({appointments:{NEW:{}},busy:false,categories:{},hierarchySuggestion:"",legendItems:Object.entries(o.getItems()).map(([e,{type:s}])=>({text:t.getText(`legendItems.${e}`),type:s}))});s.setSelectedView(a);s.setStartDate(l());c.setSizeLimit(300);this.setModel(c);await this.getModel("OData").metadataLoaded();try{await Promise.all([this._loadAppointments(),this._loadHierarchy()])}catch(t){r.error(e.parse(t))}$(document).keydown(e=>{const s=$(document.activeElement)&&$(document.activeElement).control()[0]&&$(document.activeElement).control()[0].getId();if(e.ctrlKey){if(e.keyCode===13&&!this.byId("submitButton").getEnabled()){i.show(t.getText("appointmentDialog.invalidInput"));return}if(e.keyCode===13&&s&&!s.includes("submitButton")){e.preventDefault();this.onSubmitEntry()}else if(e.keyCode===46){e.preventDefault();const t=sap.ui.getCore().byId(s);const a=t.getBindingContext().getObject();this._deleteAppointment(a)}}});this.byId("hierarchySearch").setFilterFunction((t,e)=>e.getText().match(new RegExp(t,"i")))},onSelectHierarchy(t){const{listItem:e}=t.getParameters();const s=e.getBindingContext().getProperty("path");const a=t.getSource().getBindingContext().getPath();this.getModel().setProperty(`${a}/parentPath`,s)},onDisplayLegend(){this.byId("legendDialog").open()},onPressAppointment(t){const{appointment:e}=t.getParameters();if(e){this._bindAndOpenDialog(e.getBindingContext().getPath())}},async onEditAppointment(t){const e=this.getModel();const{categories:s}=e.getData();const{startDate:a,endDate:n,appointment:o,copy:r}=t.getParameters();const i=o.getBindingContext();const c=i.getObject();let l=i.getPath();if(r){l="/appointments/NEW";e.setProperty("/appointments/NEW",o)}e.setProperty(`${l}/activatedDate`,a);e.setProperty(`${l}/completedDate`,n);if(!c.parentPath){this._bindAndOpenDialog(l);return}this._submitEntry({...c,activatedDate:a,completedDate:n})},onPressDeleteAppointment(t){const e=t.getSource().getBindingContext().getObject();this._deleteAppointment(e)},async _deleteAppointment(t){const s=this.getModel();const{appointments:a}=s.getData();s.setProperty("/dialogBusy",true);try{await this.remove({path:`/MyWorkItems(ID=\'${encodeURIComponent(t.ID)}\')`,data:t});delete a[t.ID];this._closeDialog("createItemDialog")}catch(t){r.error(e.parse(t))}s.setProperty("/dialogBusy",false)},async onPressResetAppointment(t){const s=this.getModel();const{appointments:a}=s.getData();const n=t.getSource().getBindingContext().getObject();s.setProperty("/dialogBusy",true);try{const t=await this.reset({path:`/MyWorkItems(ID=\'${encodeURIComponent(n.ID)}\')`,data:n});a[t.ID]=t;await this._loadAppointments();this._closeDialog("createItemDialog")}catch(t){r.error(e.parse(t))}s.setProperty("/dialogBusy",false)},onCreateAppointment(t){this._createAppointment(t);this._bindAndOpenDialog("/appointments/NEW")},_createAppointment(t){const e=this.getModel();const{startDate:s,endDate:a}=t.getParameters();const n={activatedDate:s,completedDate:a,hierarchy:{}};e.setProperty("/appointments/NEW",n)},_bindAndOpenDialog(t){const e=this.getModel();const s=this.getResourceBundle();const a=e.getProperty(t);const n=this.byId("createItemDialog");e.setProperty("/createItemDialogTitle",a.ID?s.getText("editAppointment"):s.getText("createAppointment"));this._filterHierarchyByPath(a.parentPath);n.bindElement(t);n.open()},onChangeHierarchy(t){const{newValue:e}=t.getParameters();this._filterHierarchyByPath(e)},_filterHierarchyByPath(t){const e=[new s({path:"path",test:e=>{if(!t)return false;const s=t.split(" ");return s.map(t=>t.toUpperCase()).every(t=>e.includes(t))}})];this.byId("hierarchyTree").getBinding("items").filter(e)},async onSubmitEntry(){const t=this.getModel();const e=this.byId("createItemDialog").getBindingContext().getObject();if(e.isAllDay){i.show(this.getResourceBundle().getText("message.allDayEventsAreNotEditable"));return}t.setProperty("/dialogBusy",true);await this._submitEntry(e);t.setProperty("/dialogBusy",false);this._closeDialog("createItemDialog")},async _submitEntry(t){const s=this.getModel();const{appointments:a,categoriesFlat:n}=s.getData();const{hierarchy:o,...i}=t;const c=n.find(e=>e.path===t.parentPath);i.parentPath=undefined;i.parent_ID=c.ID;let l;try{if(t.ID){const e=`/MyWorkItems(ID=\'${encodeURIComponent(t.ID)}\')`;l=await this.update({path:e,data:i})}else{l=await this.create({path:"/MyWorkItems",data:i})}l.parentPath=t.parentPath;l.tags=t.tags;a[l.ID]=l;a.NEW={};s.setProperty("/appointments",a)}catch(t){r.error(e.parse(t))}},onCloseDialog(t){t.getSource().getParent().close()},_closeDialog(t){this.byId(t).close()},onAfterCloseDialog(){this.getModel().setProperty("/appointments/NEW",{})},onChangeView(){this._loadAppointments()},onStartDateChange(){this._loadAppointments()},onUpdateTags(t){const e=this.getModel();const s=t.getSource();const a=s.getBindingContext().getPath();this._removeDuplicateTokens(s);const n=s.getTokens().map(t=>({tag_title:t.getKey()}));e.setProperty(`${a}/tags`,n);this._suggestCategory(n)},async _suggestCategory(t){const e=t.map(({tag_title:t})=>t).join(" ");const{results:s}=await this.read({path:"/MatchCategory2Tags",urlParameters:{$search:e}});this.getModel().setProperty("/hierarchySuggestion",s[0]?s[0].categoryTitle:"")},_removeDuplicateTokens(t){const e=t.getTokens();const s={};e.forEach(t=>{const e=t.getText();s[e]=t});t.setTokens(Object.values(s))},onDeleteToken(t){const e=t.getSource();const s=e.getParent();s.removeToken(e)},_getCalendarEndDate(){const t=this.byId("SPCalendar");const e=t.getStartDate();const s=t._getSelectedView().getKey();const a={Day:1,WorkWeek:5,Week:7,Month:31};const n=a[s];const o=c(e,n);return o},async _loadAppointments(){const t=this.getModel();const e=this.byId("SPCalendar");const a=t.getProperty("/appointments");const n=e.getStartDate();const o=this._getCalendarEndDate();t.setProperty("/busy",true);const{results:r}=await this.read({path:"/MyWorkItems",urlParameters:{$top:100,$expand:"tags"},filters:[new s({filters:[new s({path:"completedDate",operator:"GT",value1:n}),new s({path:"activatedDate",operator:"LE",value1:o})],and:true})]});const i=r.reduce((t,e)=>{const s=e.tags.results;t[e.ID]={completedDate:e.isAllDay?e.completedDate.setHours(0):e.completedDate,activatedDate:e.isAllDay?e.activatedDate.setHours(0):e.activatedDate,...e,tags:s};return t},{});t.setProperty("/appointments",{...a,...i});t.setProperty("/busy",false)},async _loadHierarchy(){const t=this.getModel();t.setProperty("/busy",true);const[{results:e}]=await Promise.all([this.read({path:"/MyCategories"})]);const s=nest(e);t.setProperty("/categoriesNested",s);t.setProperty("/MyCategories",e);t.setProperty("/busy",false)},_getUser(){return new Promise((t,e)=>{this.getModel("OData").read("/MyUser",{success:s=>{const a=s.results[0];if(!a)e(new Error("User does not exist in DB. Please create it."));return t(a)}})})}})});',
  "iot/singleplanningcalendar/i18n/i18n.properties":
    "appTitle=My Calendar\r\nappSubtitle=Track & Plan\r\nappDescription=Plan and confirm your work\r\n\r\nappointmentDialogTitle=Create new entry\r\nappointmentDialog.draftIndicator= - Draft\r\n\r\ncreateAppointment.button.text=Create\r\ncreateAppointment.button.tooltip=Create new entry\r\n\r\ndisplayLegend.button.text=Display Legend\r\ndisplayLegend.button.tooltip=Display Legend for appointments\r\n\r\ncreateAppointment=Create new entry\r\neditAppointment=Edit entry\r\n\r\nresetEntry.button.text=Reset\r\nresetEntry.button.tooltip=Reset entry\r\nresetEntry.button.tooltip.resetNotAllowed=Reset is not allowed for unconfirmed entries and entries of type 'Manual'\r\n\r\ndeleteEntry.button.text=Delete\r\ndeleteEntry.button.tooltip=Delete entry\r\n\r\nenterDetailsFirst=Enter details first\r\n\r\nlegend.title=Legend\r\n\r\nlegendItems.Manual_Allocated_Billed=Manual, Allocated, Billed\r\nlegendItems.Manual_Allocated_NotBilled=Manual, Allocated, Not Billed\r\nlegendItems.Manual_NotAllocated_Billed=Manual, Not Allocated, Billed\r\nlegendItems.Manual_NotAllocated_NotBilled=Manual, Not Allocated, Not Billed\r\nlegendItems.WorkItem_Allocated_Billed=WorkItem, Allocated, Billed\r\nlegendItems.WorkItem_Allocated_NotBilled=WorkItem, Allocated, Not Billed\r\nlegendItems.WorkItem_NotAllocated_Billed=WorkItem, Not Allocated, Billed\r\nlegendItems.WorkItem_NotAllocated_NotBilled=WorkItem, Not Allocated, Not Billed\r\nlegendItems.Event_Allocated_Billed=Event, Allocated, Billed\r\nlegendItems.Event_Allocated_NotBilled=Event, Allocated, Not Billed\r\nlegendItems.Event_NotAllocated_Billed=Event, Not Allocated, Billed\r\nlegendItems.Event_NotAllocated_NotBilled=Event, Not Allocated, Not Billed\r\n\r\ncalendar.dayView=Day\r\ncalendar.weekView=Week\r\ncalendar.workWeekView=Work Week\r\ncalendar.monthView=Month\r\n\r\nOK=OK\r\nclose=Close\r\n\r\nWorkItems.ID=ID\r\nWorkItems.assignedTo=Assigned To\r\nWorkItems.assignedToName=Assigned To Name\r\nWorkItems.changedDate=Changed Date\r\nWorkItems.createdDate=Created Date\r\nWorkItems.reason=Reason\r\nWorkItems.state=State\r\nWorkItems.teamProject=Team Project\r\nWorkItems.title=Title\r\nWorkItems.tags=Tags\r\nWorkItems.hierarchy=Hierarchy\r\nWorkItems.workItemType=Type\r\n\r\nWorkItems.completedWork=Completed Work\r\nWorkItems.remainingWork=Remaining Work\r\nWorkItems.originalEstimate=Original Estimate\r\n\r\nWorkItems.activatedDate=Activated Date\r\nWorkItems.resolvedDate=Resolved Date\r\nWorkItems.completedDate=Completed Date\r\nWorkItems.closedDate=Closed Date\r\n\r\nWorkItems.customer=Customer\r\nWorkItems.type=Type\r\nWorkItems.private=Private\r\nWorkItems.project=Project\r\nWorkItems.subproject=Subproject\r\nWorkItems.workPackage=Package\r\nWorkItems.ticket=Ticket\r\n\r\nappointmentDialog.invalidInput=Please fill-in all\r\n\r\nmessage.allDayEventsAreNotEditable=All-day events cannot be edited.",
  "iot/singleplanningcalendar/manifest.json":
    '{"_version":"1.9.0","sap.cloud":{"public":true,"service":"iot.project.planner"},"sap.app":{"id":"iot.singleplanningcalendar","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","ach":"ach","dataSources":{"mainService":{"uri":"/v2/timetracking/","type":"OData"}},"crossNavigation":{"inbounds":{"iot-singleplanningcalendar-inbound":{"signature":{"parameters":{},"additionalParameters":"allowed"},"semanticObject":"SinglePlanningCalendar","action":"manage","title":"{{appTitle}}","subTitle":"{{appSubtitle}}","icon":"sap-icon://calendar"}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"sap-icon://task","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":false,"rootView":{"viewName":"iot.singleplanningcalendar.view.SinglePlanningCalendar","type":"XML","async":true,"id":"SinglePlanningCalendar"},"dependencies":{"minUI5Version":"1.66.0","libs":{"sap.ui.core":{},"sap.m":{},"sap.ui.layout":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"iot.singleplanningcalendar.i18n.i18n"}},"OData":{"dataSource":"mainService","type":"sap.ui.model.odata.v2.ODataModel","settings":{"defaultUpdateMethod":"MERGE","defaultOperationMode":"Server","defaultBindingMode":"TwoWay","refreshAfterChange":false,"defaultCountMode":"None"}}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","async":true,"viewPath":"iot.singleplanningcalendar.view","controlAggregation":"pages","controlId":"app","clearControlAggregation":false},"routes":[{"name":"RouteSinglePlanningCalendar","pattern":"RouteSinglePlanningCalendar","target":["TargetSinglePlanningCalendar"]}],"targets":{"TargetSinglePlanningCalendar":{"viewType":"XML","transition":"slide","clearControlAggregation":false,"viewId":"SinglePlanningCalendar","viewName":"SinglePlanningCalendar"}}}}}',
  "iot/singleplanningcalendar/model/formatter.js": function () {
    sap.ui.define(["../model/legendItems"], (e) => ({
      getDisplayType(t, n, l) {
        const i = n ? "Allocated" : "NotAllocated";
        const o = l === "Billed" ? "Billed" : "NotBilled";
        const { type: d } = e.getItems()[`${t}_${i}_${o}`] || {
          type: "Type01",
        };
        return d;
      },
      getIconURL(e) {
        if (!e) return undefined;
        return this.getOwnerComponent()
          .getManifestObject()
          .resolveUri(`./img/${e}.png`);
      },
    }));
  },
  "iot/singleplanningcalendar/model/legendItems.js": function () {
    sap.ui.define([], () => ({
      getItems() {
        return {
          Manual_Allocated_Billed: { type: "Type01" },
          Manual_Allocated_NotBilled: { type: "Type02" },
          Manual_NotAllocated_Billed: { type: "Type03" },
          Manual_NotAllocated_NotBilled: { type: "Type04" },
          WorkItem_Allocated_Billed: { type: "Type05" },
          WorkItem_Allocated_NotBilled: { type: "Type06" },
          WorkItem_NotAllocated_Billed: { type: "Type07" },
          WorkItem_NotAllocated_NotBilled: { type: "Type08" },
          Event_Allocated_Billed: { type: "Type09" },
          Event_Allocated_NotBilled: { type: "Type10" },
          Event_NotAllocated_Billed: { type: "Type11" },
          Event_NotAllocated_NotBilled: { type: "Type12" },
        };
      },
    }));
  },
  "iot/singleplanningcalendar/model/models.js": function () {
    sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], (e, i) => ({
      createDeviceModel() {
        const n = new e(i);
        n.setDefaultBindingMode("OneWay");
        return n;
      },
    }));
  },
  "iot/singleplanningcalendar/view/SinglePlanningCalendar.view.xml":
    '<mvc:View controllerName="iot.singleplanningcalendar.controller.SinglePlanningCalendar"\r\n\txmlns="sap.m"\r\n\txmlns:unified="sap.ui.unified"\r\n\txmlns:f="sap.ui.layout.form"\r\n\txmlns:core="sap.ui.core"\r\n\txmlns:table="sap.ui.table"\r\n\txmlns:l="sap.ui.layout"\r\n\txmlns:smartfield="sap.ui.comp.smartfield"\r\n\txmlns:mvc="sap.ui.core.mvc" displayBlock="true"><Shell id="shell"><App id="app" busy="{/busy}" busyIndicatorDelay="0"><pages><Page showHeader="false"><SinglePlanningCalendar id="SPCalendar" appointments="{/appointments}" appointmentSelect="onPressAppointment" appointmentCreate="onCreateAppointment" appointmentResize="onEditAppointment" appointmentDrop="onEditAppointment" startDateChange="onStartDateChange" viewChange="onChangeView" startHour="7" endHour="20" fullDay="false" enableAppointmentsCreate="true" enableAppointmentsResize="true" enableAppointmentsDragAndDrop="true"><actions><Button id="createAppointment" text="{i18n>createAppointment.button.text}" press="onCreateAppointment" tooltip="{i18n>createAppointment.button.tooltip}" /><Button id="displayLegend" text="{i18n>displayLegend.button.text}" press="onDisplayLegend" tooltip="{i18n>displayLegend.button.tooltip}" /></actions><appointments><unified:CalendarAppointment startDate="{activatedDate}" endDate="{completedDate}" title="{ticket} {title}" text="{customer_friendlyID} {project_friendlyID}" type="{parts: [\'type\', \'project_friendlyID\', \'status\'], formatter: \'.formatter.getDisplayType\'}" icon="{path: \'customer_friendlyID\', formatter: \'.formatter.getIconURL\'}" tentative="{= !${confirmed}}"/></appointments><dependents><Dialog id="createItemDialog" busy="{/dialogBusy}" afterClose="onAfterCloseDialog" afterOpen="onAfterOpenDialog" contentHeight="400px" contentWidth="670px"><customHeader><Bar><contentLeft><Title text="{/createItemDialogTitle} {= !${confirmed} ? ${i18n>appointmentDialog.draftIndicator} : \'\'}"/></contentLeft><contentRight><Button press="onPressResetAppointment" text="{i18n>resetEntry.button.text}" tooltip="{i18n>resetEntry.button.tooltip}" enabled="{= !!${confirmed} &amp;&amp; !${isAllDay}}"/><Button press="onPressDeleteAppointment" text="{i18n>deleteEntry.button.text}" tooltip="{i18n>deleteEntry.button.tooltip}" enabled="{= !${isAllDay}}"/></contentRight></Bar></customHeader><MessageStrip text="{i18n>message.allDayEventsAreNotEditable}" visible="{= !!${isAllDay}}" class="sapUiTinyMargin"/><f:Form id="appointmentForm" editable="true"><f:layout><f:ResponsiveGridLayout labelSpanXL="4" labelSpanL="4" labelSpanM="12" labelSpanS="12" adjustLabelSpan="false" emptySpanXL="0" emptySpanL="0" emptySpanM="0" emptySpanS="0" columnsXL="2" columnsL="2" columnsM="2" singleContainerFullSize="false" /></f:layout><f:formContainers><f:FormContainer><f:formElements><f:FormElement label="{i18n>WorkItems.title}"><f:fields><Input value="{title}"/></f:fields></f:FormElement><f:FormElement label="{i18n>WorkItems.hierarchy}"><f:fields><Input id="hierarchySearch" value="{parentPath}" suggestionItems="{/MyCategories}" liveChange="onChangeHierarchy"><suggestionItems><core:Item text="{path}" key="{ID}"/></suggestionItems></Input></f:fields></f:FormElement><f:FormElement><f:fields><Tree mode="SingleSelectMaster" selectionChange="onSelectHierarchy" id="hierarchyTree" items="{path: \'/categoriesNested\', parameters: {numberOfExpandedLevels: 5, arrayNames: [\'children\']}}"><StandardTreeItem title="{title}"/></Tree></f:fields></f:FormElement></f:formElements></f:FormContainer><f:FormContainer><f:formElements><f:FormElement label="{i18n>WorkItems.tags}"><f:fields><MultiInput tokens="{path: \'tags\', templateShareable: false}" suggestionItems="{\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tpath: \'OData>/Tags\',\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\ttemplateShareable: false,\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tsorter: { path: \'title\' }\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t}" showValueHelp="false" tokenUpdate="onUpdateTags"><suggestionItems><core:Item key="{OData>title}" text="{OData>title}"/></suggestionItems><tokens><Token key="{tag_title}" text="{tag_title}" delete="onDeleteToken"/></tokens></MultiInput><Text text="{/hierarchySuggestion}"/></f:fields></f:FormElement><f:FormElement label="{i18n>WorkItems.activatedDate}"><f:fields><DateTimePicker value="{path:\'activatedDate\', type:\'sap.ui.model.type.DateTime\', formatOptions: {style: \'short\'}}" minutesStep="15"/></f:fields></f:FormElement><f:FormElement label="{i18n>WorkItems.completedDate}"><f:fields><DateTimePicker value="{path: \'completedDate\', type:\'sap.ui.model.type.DateTime\', formatOptions: {style: \'short\'}}" minutesStep="15"/></f:fields></f:FormElement></f:formElements></f:FormContainer></f:formContainers></f:Form><buttons><Button id="submitButton" text="{i18n>OK}" press="onSubmitEntry" enabled="{= !!${title} &amp;&amp; !!${parentPath} &amp;&amp; !${isAllDay}}" type="Emphasized"/><Button text="{i18n>close}" press="onCloseDialog" /></buttons></Dialog><Dialog id="legendDialog" title="{i18n>legend.title}"><PlanningCalendarLegend id="singlePlanningCalendarLegend" items="{path : \'/legendItems\', templateShareable: true}" class="sapUiSmallMarginTop"><items><unified:CalendarLegendItem text="{text}" type="{type}" /></items></PlanningCalendarLegend><buttons><Button text="{i18n>close}" press="onCloseDialog" /></buttons></Dialog></dependents><views><SinglePlanningCalendarDayView key="Day" id="dayView" title="{i18n>calendar.dayView}" /><SinglePlanningCalendarWorkWeekView key="WorkWeek" title="{i18n>calendar.workWeekView}" /><SinglePlanningCalendarWeekView key="Week" title="{i18n>calendar.weekView}"/><SinglePlanningCalendarMonthView key="Month" id="monthView" title="{i18n>calendar.monthView}" /></views></SinglePlanningCalendar></Page></pages></App></Shell></mvc:View>',
});
