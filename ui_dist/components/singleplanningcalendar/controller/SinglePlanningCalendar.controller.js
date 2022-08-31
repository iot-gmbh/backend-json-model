const capitalizeFirstLetter=t=>t.charAt(0).toUpperCase()+t.slice(1);sap.ui.define(["./BaseController","./ErrorParser","sap/ui/model/Filter","../model/formatter","../model/legendItems","sap/m/MessageBox","sap/m/MessageToast"],(t,e,s,a,n,o,r)=>{function i(t,e){const s=new Date(t);s.setDate(s.getDate()+e);return s}function c(){const t=new Date((new Date).setHours(0,0,0,1));const e=t.getDay();const s=t.getDate()-e+(e===0?-6:1);return new Date(t.setDate(s))}return t.extend("iot.planner.components.singleplanningcalendar.controller.SinglePlanningCalendar",{formatter:a,async onInit(){const t=this.getResourceBundle();const s=this.byId("SPCalendar");const a=s.getViews()[1];s.setSelectedView(a);s.setStartDate(c());await this.getModel("OData").metadataLoaded();try{await Promise.all([this._loadAppointments(),this._loadHierarchy()])}catch(t){o.error(e.parse(t))}$(document).keydown(e=>{const s=$(document.activeElement)&&$(document.activeElement).control()[0]&&$(document.activeElement).control()[0].getId();if(e.ctrlKey){if(e.keyCode===13&&!this.byId("submitButton").getEnabled()){r.show(t.getText("appointmentDialog.invalidInput"));return}if(e.keyCode===13&&s&&!s.includes("submitButton")){e.preventDefault();this.onSubmitEntry()}else if(e.keyCode===46){e.preventDefault();const t=sap.ui.getCore().byId(s);const a=t.getBindingContext().getObject();this._deleteAppointment(a)}}});this.byId("hierarchySearch").setFilterFunction((t,e)=>e.getText().match(new RegExp(t,"i")))},onBeforeRendering(){const t=this.getResourceBundle();const e=this.getModel();e.setData({MyWorkItems:{NEW:{}},busy:false,categories:{},hierarchySuggestion:"",legendItems:Object.entries(n.getItems()).map(([e,{type:s}])=>({text:t.getText(`legendItems.${e}`),type:s}))});e.setSizeLimit(300)},onSelectHierarchy(t){const{listItem:e}=t.getParameters();const s=e.getBindingContext().getProperty("path");const a=t.getSource().getBindingContext().getPath();this.getModel().setProperty(`${a}/parentPath`,s)},onDisplayLegend(){this.byId("legendDialog").open()},onPressAppointment(t){const{appointment:e}=t.getParameters();if(e){this._bindAndOpenDialog(e.getBindingContext().getPath())}},async onEditAppointment(t){const e=this.getModel();const{startDate:s,endDate:a,appointment:n,copy:o}=t.getParameters();const r=n.getBindingContext();const i=r.getObject();let c=r.getPath();if(o){c="/MyWorkItems/NEW";e.setProperty("/MyWorkItems/NEW",n)}e.setProperty(`${c}/activatedDate`,s);e.setProperty(`${c}/completedDate`,a);if(!i.parentPath){this._bindAndOpenDialog(c);return}this._submitEntry({...i,activatedDate:s,completedDate:a,localPath:c})},onPressDeleteAppointment(t){const e=t.getSource().getBindingContext().getObject();this._deleteAppointment(e)},async _deleteAppointment(t){const s=this.getModel();const{MyWorkItems:a}=s.getData();s.setProperty("/dialogBusy",true);try{await s.remove(t);if(t.source!=="Manual"){await s.callFunction("/removeDraft",{method:"POST",urlParameters:{ID:t.ID,activatedDate:t.activatedDate,completedDate:t.completedDate}})}this._closeDialog("createItemDialog")}catch(t){o.error(e.parse(t))}s.setProperty("/dialogBusy",false)},async onPressResetAppointment(t){const s=this.getModel();const a=t.getSource().getBindingContext();const n=a.getObject();const r=a.getPath();s.setProperty("/dialogBusy",true);try{const t=await s.callFunction("/resetToDraft",{method:"POST",urlParameters:{ID:n.ID}});s.setProperty(r,t);this._closeDialog("createItemDialog")}catch(t){o.error(e.parse(t))}s.setProperty("/dialogBusy",false)},onCreateAppointment(t){this._createAppointment(t);this._bindAndOpenDialog("/MyWorkItems/NEW")},_createAppointment(t){const e=this.getModel();const{startDate:s,endDate:a}=t.getParameters();const n={activatedDate:s,completedDate:a};e.setProperty("/MyWorkItems/NEW",n)},_bindAndOpenDialog(t){const e=this.getModel();const s=this.getResourceBundle();const a=e.getProperty(t);const n=this.byId("createItemDialog");e.setProperty("/createItemDialogTitle",a.ID?s.getText("editAppointment"):s.getText("createAppointment"));this._filterHierarchyByPath(a.parentPath);n.bindElement(t);n.open()},onChangeHierarchy(t){const{newValue:e}=t.getParameters();this._filterHierarchyByPath(e)},_filterHierarchyByPath(t){const e=[new s({filters:[new s({path:"path",test:e=>{if(!t||!e)return false;const s=t.split(" ");return s.map(t=>t.toUpperCase()).every(t=>e.includes(t))}}),new s({path:"path",test:e=>{if(!t||!e)return false;const s=t.split(" ");return s.map(t=>t.toUpperCase()).every(t=>e.includes(t))}}),new s({path:"deepReference",test:e=>{if(!t||!e)return false;const s=t.split(" ");return s.map(t=>t.toUpperCase()).every(t=>e.includes(t))}})],and:false})];this.byId("hierarchyTree").getBinding("items").filter(e)},async onSubmitEntry(){const t=this.getModel();const e=this.byId("createItemDialog").getBindingContext().getObject();const s=this.byId("createItemDialog").getBindingContext().getPath();if(e.isAllDay){r.show(this.getResourceBundle().getText("message.allDayEventsAreNotEditable"));return}t.setProperty("/dialogBusy",true);e.localPath=s;await this._submitEntry(e);t.setProperty("/dialogBusy",false);this._closeDialog("createItemDialog")},async _submitEntry(t){const s=this.getModel();const{MyCategories:a}=s.getData();const n=a.find(e=>e.path===t.parentPath);const r=t;r.parentPath=n.path;r.parent_ID=n.ID;try{if(r.ID){await s.update(r)}else{await s.create("/MyWorkItems",r);s.setProperty("/MyWorkItems/NEW",{})}}catch(t){o.error(e.parse(t))}},onCloseDialog(t){t.getSource().getParent().close()},_closeDialog(t){this.byId(t).close()},onAfterCloseDialog(){this.getModel().setProperty("/MyWorkItems/NEW",{})},onChangeView(){this._loadAppointments()},onStartDateChange(){this._loadAppointments()},onUpdateTags(t){const e=this.getModel();const s=t.getSource();const a=s.getBindingContext().getPath();this._removeDuplicateTokens(s);const n=s.getTokens().map(t=>({tag_title:t.getKey()}));e.setProperty(`${a}/tags`,n);this._suggestCategory(n)},async _suggestCategory(t){const e=t.map(({tag_title:t})=>t).join(" ");const{results:s}=await this.read({path:"/MatchCategory2Tags",urlParameters:{$search:e}});this.getModel().setProperty("/hierarchySuggestion",s[0]?s[0].categoryTitle:"")},_removeDuplicateTokens(t){const e=t.getTokens();const s={};e.forEach(t=>{const e=t.getText();s[e]=t});t.setTokens(Object.values(s))},onDeleteToken(t){const e=t.getSource();const s=e.getParent();s.removeToken(e)},_getCalendarEndDate(){const t=this.byId("SPCalendar");const e=t.getStartDate();const s=t._getSelectedView().getKey();const a={Day:1,WorkWeek:5,Week:7,Month:31};const n=a[s];const o=i(e,n);return o},async _loadAppointments(){const t=this.getModel();const e=this.byId("SPCalendar");const s=e.getStartDate();const a=this._getCalendarEndDate();t.setProperty("/busy",true);const{results:n}=await t.callFunction("/getCalendarView",{urlParameters:{startDateTime:s,endDateTime:a}});const o=n.map(({completedDate:t,activatedDate:e,isAllDay:s,...a})=>({...a,tags:a.tags.results,completedDate:s?t.setHours(0):t,activatedDate:s?e.setHours(0):e}));t.setProperty("/MyWorkItems",o);t.setProperty("/busy",false)},async _loadHierarchy(){const t=this.getModel();t.setProperty("/busy",true);const{results:e}=await t.callFunction("/getMyCategoryTree");const s=t.nest({items:e});t.setProperty("/MyCategories",e);t.setProperty("/MyCategoriesNested",s);t.setProperty("/busy",false)},_getUser(){return new Promise((t,e)=>{this.getModel("OData").read("/MyUser",{success:s=>{const a=s.results[0];if(!a)e(new Error("User does not exist in DB. Please create it."));return t(a)}})})}})});