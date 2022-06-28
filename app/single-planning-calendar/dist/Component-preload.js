//@ui5-bundle iot/singleplanningcalendar/Component-preload.js
sap.ui.require.preload({
  "iot/singleplanningcalendar/Component.js": function () {
    sap.ui.define(
      [
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "iot/singleplanningcalendar/model/models",
      ],
      function (e, i, n) {
        "use strict";
        return e.extend("iot.singleplanningcalendar.Component", {
          metadata: { manifest: "json" },
          init: function () {
            e.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
            this.setModel(n.createDeviceModel(), "device");
          },
        });
      }
    );
  },
  "iot/singleplanningcalendar/controller/BaseController.js": function () {
    sap.ui.define(
      ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
      function (e, t) {
        "use strict";
        return e.extend(
          "iot.singleplanningcalendar.controller.BaseController",
          {
            getRouter: function () {
              return this.getOwnerComponent().getRouter();
            },
            getModel: function (e) {
              return this.getView().getModel(e);
            },
            setModel: function (e, t) {
              return this.getView().setModel(e, t);
            },
            getResourceBundle: function () {
              return this.getOwnerComponent()
                .getModel("i18n")
                .getResourceBundle();
            },
            async read({ path: e, ...t }) {
              return new Promise((r, n) => {
                this.getModel("OData").read(e, { ...t, success: r, error: n });
              });
            },
            async update({ path: e, data: t }) {
              return new Promise((r, n) => {
                this.getModel("OData").update(e, t, { success: r, error: n });
              });
            },
            async create({ path: e, data: t }) {
              return new Promise((r, n) => {
                this.getModel("OData").create(e, t, { success: r, error: n });
              });
            },
            async reset({ path: e, data: t }) {
              return new Promise((r, n) => {
                this.getModel("OData").update(
                  e,
                  { ...t, resetEntry: true },
                  { success: r, error: n }
                );
              });
            },
            async remove({
              path: e,
              data: { ID: t, activatedDate: r, completedDate: n },
            }) {
              return new Promise((a, s) => {
                this.getModel("OData").update(
                  e,
                  { ID: t, activatedDate: r, completedDate: n, deleted: true },
                  { success: a, error: s }
                );
              });
            },
            onNavBack: function () {
              var e = t.getInstance().getPreviousHash();
              if (e !== undefined) {
                history.go(-1);
              } else {
                this.getRouter().navTo("master", {}, true);
              }
            },
          }
        );
      }
    );
  },
  "iot/singleplanningcalendar/controller/ErrorParser.js":
    "function extractErrorMsgFromXML(r){const e=new DOMParser;const t=e.parseFromString(r,\"text/xml\");return t.getElementsByTagName(\"error\")[0].getElementsByTagName(\"message\")[0].childNodes[0].wholeText}function extractErrorMsgFromJSON(r){const e=JSON.parse(r.responseText);const t=e.error.message.value||\"The error could not be parsed.\";return t}function parseError(r){try{if(!r.responseText&&r.message)return r.message;return extractErrorMsgFromJSON(r)}catch(e){try{return extractErrorMsgFromXML(r)}catch(r){return\"The error message could not be parsed.\"}}}sap.ui.define([],()=>({parse(r){const e=parseError(r);return e}}));",
  "iot/singleplanningcalendar/controller/SinglePlanningCalendar.controller.js":
    function () {
      sap.ui.define(
        [
          "./BaseController",
          "./ErrorParser",
          "sap/ui/model/Filter",
          "../model/formatter",
          "sap/ui/model/json/JSONModel",
          "../model/legendItems",
          "sap/m/MessageBox",
          "sap/m/MessageToast",
        ],
        function (e, t, s, o, n, a, r, i) {
          function c(e, t) {
            const s = new Date(e);
            s.setDate(s.getDate() + t);
            return s;
          }
          function l() {
            const e = new Date(new Date().setHours(0, 0, 0, 1));
            const t = e.getDay();
            const s = e.getDate() - t + (t == 0 ? -6 : 1);
            return new Date(e.setDate(s));
          }
          const p = ["customerSelect", "projectSelect", "packageSelect"];
          return e.extend(
            "iot.singleplanningcalendar.controller.SinglePlanningCalendar",
            {
              formatter: o,
              onInit: async function () {
                const e = this.getResourceBundle();
                const s = this.byId("SPCalendar");
                const o = s.getViews()[1];
                const c = this.byId("createItemDialog");
                const p = new n({
                  appointments: { NEW: {} },
                  busy: false,
                  customers: [],
                  projects: [],
                  projectsFiltered: [],
                  workPackages: [],
                  workPackagesFiltered: [],
                  legendItems: Object.entries(a.getItems()).map(
                    ([t, { type: s }]) => ({
                      text: e.getText(`legendItems.${t}`),
                      type: s,
                    })
                  ),
                });
                s.setSelectedView(o);
                s.setStartDate(l());
                p.setSizeLimit(300);
                this.setModel(p);
                await this.getModel("OData").metadataLoaded();
                try {
                  await Promise.all([
                    this._loadAppointments(),
                    this._loadCustomersAndProjects(),
                  ]);
                } catch (e) {
                  r.error(t.parse(e));
                }
                $(document).keydown((t) => {
                  const s =
                    $(document.activeElement) &&
                    $(document.activeElement).control()[0] &&
                    $(document.activeElement).control()[0].getId();
                  if (t.ctrlKey) {
                    if (
                      t.keyCode === 13 &&
                      !this.byId("submitButton").getEnabled()
                    ) {
                      i.show(e.getText("appointmentDialog.invalidInput"));
                      return;
                    }
                    if (t.keyCode === 13 && s && !s.includes("submitButton")) {
                      t.preventDefault();
                      this.onSubmitEntry();
                    } else if (t.keyCode === 46) {
                      t.preventDefault();
                      const e = sap.ui.getCore().byId(s);
                      const o = e.getBindingContext().getObject();
                      this._deleteAppointment(o);
                    }
                  }
                });
              },
              onAfterOpenDialog() {
                this._refreshSelectControls();
              },
              _getSelectControls() {
                return p.map((e) => this.byId(e));
              },
              _refreshSelectControls() {
                this._getSelectControls().forEach((e) =>
                  e.getBinding("items").refresh()
                );
              },
              onSelectCustomer(e) {
                const t = this.getModel();
                const s = e.getParameter("selectedItem");
                if (!s) return;
                const o = s.getBindingContext().getObject();
                const { projects: n, workPackages: a } = t.getData();
                const r = n.filter(({ customer_ID: e }) => e === o.ID);
                const i = r[0];
                let c = [];
                let l = "";
                let p = "";
                if (i) {
                  c = a.filter(({ project_ID: e }) => e === i.ID);
                  l = i.ID;
                  p = c[0] ? c[0].ID : "";
                  this.byId("projectSelect").setSelectedKey(l);
                  this.byId("packageSelect").setSelectedKey(p);
                }
                t.setProperty("/projectsFiltered", r);
                t.setProperty("/workPackagesFiltered", c);
              },
              onSelectProject(e) {
                const t = this.getModel();
                const s = e.getParameter("selectedItem");
                if (!s) return;
                const o = s.getBindingContext().getObject();
                const { workPackages: n } = t.getData();
                const a = n.filter(({ project_ID: e }) => e === o.ID);
                const r = a[0] ? a[0].ID : "";
                t.setProperty("/workPackagesFiltered", a);
                this.byId("packageSelect").setSelectedKey(r);
              },
              onDisplayLegend() {
                this.byId("legendDialog").open();
              },
              onPressAppointment(e) {
                const { appointment: t } = e.getParameters();
                if (t) {
                  this._bindAndOpenDialog(t.getBindingContext().getPath());
                }
              },
              async onEditAppointment(e) {
                const s = this.getModel();
                const { appointments: o } = s.getData();
                const {
                  startDate: n,
                  endDate: a,
                  appointment: i,
                  copy: c,
                } = e.getParameters();
                const l = i.getBindingContext();
                const p = l.getObject();
                let d = l.getPath();
                if (c) {
                  d = "/appointments/NEW";
                  s.setProperty("/appointments/NEW", i);
                }
                s.setProperty(d + "/activatedDate", n);
                s.setProperty(d + "/completedDate", a);
                if (!p.customer_ID || !p.project_ID) {
                  this._bindAndOpenDialog(d);
                  return;
                }
                try {
                  const e = await this._submitEntry({
                    ...p,
                    activatedDate: n,
                    completedDate: a,
                  });
                  o[e.ID] = e;
                  s.setProperty("/appointments", o);
                } catch (e) {
                  r.error(t.parse(e));
                }
              },
              async _deleteAppointment(e) {
                const s = this.getModel();
                const { appointments: o } = s.getData();
                s.setProperty("/dialogBusy", true);
                try {
                  await this.remove({
                    path: `/MyWorkItems(ID='${encodeURIComponent(e.ID)}')`,
                    data: e,
                  });
                  delete o[e.ID];
                  this._closeDialog("createItemDialog");
                } catch (e) {
                  r.error(t.parse(e));
                }
                s.setProperty("/dialogBusy", false);
              },
              onPressDeleteAppointment(e) {
                const t = e.getSource().getBindingContext().getObject();
                this._deleteAppointment(t);
              },
              async onPressResetAppointment(e) {
                const s = this.getModel();
                const { appointments: o } = s.getData();
                const n = e.getSource().getBindingContext().getObject();
                s.setProperty("/dialogBusy", true);
                try {
                  const e = await this.reset({
                    path: `/MyWorkItems(ID='${encodeURIComponent(n.ID)}')`,
                    appointment: n,
                  });
                  o[e.ID] = e;
                  this._closeDialog("createItemDialog");
                } catch (e) {
                  r.error(t.parse(e));
                }
                s.setProperty("/dialogBusy", false);
              },
              onCreateAppointment(e) {
                this._createAppointment(e);
                this._bindAndOpenDialog("/appointments/NEW");
              },
              _createAppointment(e) {
                const t = this.getModel();
                const { startDate: s, endDate: o } = e.getParameters();
                const n = { activatedDate: s, completedDate: o };
                t.setProperty("/appointments/NEW", n);
              },
              _bindAndOpenDialog(e) {
                const t = this.getModel();
                const s = this.getResourceBundle();
                const o = t.getProperty(e);
                const n = this.byId("createItemDialog");
                t.setProperty(
                  "/createItemDialogTitle",
                  o.ID
                    ? s.getText("editAppointment")
                    : s.getText("createAppointment")
                );
                this.byId("packageSelect").setSelectedKey(undefined);
                this.byId("projectSelect").setSelectedKey(undefined);
                this.byId("customerSelect").setSelectedKey(undefined);
                n.bindElement(e);
                n.open();
              },
              async onSubmitEntry() {
                const e = this.getModel();
                const s = this.byId("createItemDialog")
                  .getBindingContext()
                  .getObject();
                if (s.isAllDay) {
                  i.show(
                    this.getResourceBundle().getText(
                      "message.allDayEventsAreNotEditable"
                    )
                  );
                  return;
                }
                let { appointments: o } = e.getData();
                e.setProperty("/dialogBusy", true);
                const n = this.byId("projectSelect");
                const a = this.byId("packageSelect");
                s.project_ID =
                  n.getItems().length > 0 ? n.getSelectedKey() : null;
                s.workPackage_ID =
                  a.getItems().length > 0 ? a.getSelectedKey() : null;
                try {
                  const t = await this._submitEntry(s);
                  o[t.ID] = t;
                  o["NEW"] = {};
                  e.setProperty("/appointments", o);
                } catch (e) {
                  r.error(t.parse(e));
                }
                e.setProperty("/dialogBusy", false);
                this._closeDialog("createItemDialog");
              },
              _submitEntry(e) {
                const { ID: t } = e;
                if (t) {
                  const t = `/MyWorkItems(ID='${encodeURIComponent(e.ID)}')`;
                  return this.update({ path: t, data: e });
                } else {
                  return this.create({ path: "/MyWorkItems", data: e });
                }
              },
              onAfterCloseDialog() {
                const e = this.byId("createItemDialog")
                  .getBindingContext()
                  .getObject();
                if (!e || !e.ID)
                  this.getModel().setProperty("/appointments/NEW", {});
                this.byId("createItemDialog").unbindElement();
              },
              onCloseDialog(e) {
                e.getSource().getParent().close();
              },
              _closeDialog(e) {
                this.byId(e).close();
              },
              onChangeView: function () {
                this._loadAppointments();
              },
              onStartDateChange: function () {
                this._loadAppointments();
              },
              _getCalendarEndDate() {
                const e = this.byId("SPCalendar");
                const t = e.getStartDate();
                const s = e._getSelectedView().getKey();
                const o = { Day: 1, WorkWeek: 5, Week: 7, Month: 31 };
                const n = o[s];
                const a = c(t, n);
                return a;
              },
              async _loadAppointments() {
                const e = this.getModel();
                const t = this.byId("SPCalendar");
                const o = e.getProperty("/appointments");
                const n = t.getStartDate();
                const a = this._getCalendarEndDate();
                e.setProperty("/busy", true);
                const { results: r } = await this.read({
                  path: "/MyWorkItems",
                  urlParameters: { $top: 100 },
                  filters: [
                    new s({
                      filters: [
                        new s({
                          path: "completedDate",
                          operator: "GT",
                          value1: n,
                        }),
                        new s({
                          path: "activatedDate",
                          operator: "LE",
                          value1: a,
                        }),
                      ],
                      and: true,
                    }),
                  ],
                });
                const i = r.reduce((e, t) => {
                  e[t.ID] = {
                    completedDate: t.isAllDay
                      ? t.completedDate.setHours(0)
                      : t.completedDate,
                    activatedDate: t.isAllDay
                      ? t.activatedDate.setHours(0)
                      : t.activatedDate,
                    ...t,
                  };
                  return e;
                }, {});
                e.setProperty("/appointments", { ...o, ...i });
                e.setProperty("/busy", false);
              },
              async _loadCustomersAndProjects() {
                const e = this.getModel();
                const t = await this._getUser();
                e.setProperty("/busy", true);
                const { results: o } = await this.read({
                  path: "/Users2Projects",
                  filters: [
                    new s({
                      path: "user_userPrincipalName",
                      operator: "EQ",
                      value1: t.userPrincipalName,
                    }),
                  ],
                  urlParameters: {
                    $expand: "project/customer,project/workPackages",
                  },
                });
                let n = [];
                let a = [];
                let r = [];
                o.forEach(({ project: e }) => {
                  a.push(e);
                  n.push(e.customer);
                  r.push(...e.workPackages.results);
                });
                e.setProperty("/customers", [
                  ...new Map(n.map((e) => [e.ID, e])).values(),
                ]);
                e.setProperty("/projects", a);
                e.setProperty("/workPackages", r);
                e.setProperty("/busy", false);
              },
              _getUser: function () {
                return new Promise((e, t) => {
                  this.getModel("OData").read("/MyUser", {
                    success: (s) => {
                      const o = s.results[0];
                      if (!o) t("User does not exist in DB. Please create it.");
                      return e(o);
                    },
                  });
                });
              },
            }
          );
        }
      );
    },
  "iot/singleplanningcalendar/i18n/i18n.properties":
    "appTitle=My Calendar\r\nappSubtitle=Track & Plan\r\nappDescription=Plan and confirm your work\r\n\r\nappointmentDialogTitle=Create new entry\r\nappointmentDialog.draftIndicator= - Draft\r\n\r\ncreateAppointment.button.text=Create\r\ncreateAppointment.button.tooltip=Create new entry\r\n\r\ndisplayLegend.button.text=Display Legend\r\ndisplayLegend.button.tooltip=Display Legend for appointments\r\n\r\ncreateAppointment=Create new entry\r\neditAppointment=Edit entry\r\n\r\nresetEntry.button.text=Reset\r\nresetEntry.button.tooltip=Reset entry\r\n\r\ndeleteEntry.button.text=Delete\r\ndeleteEntry.button.tooltip=Delete entry\r\n\r\nenterDetailsFirst=Enter details first\r\n\r\nlegend.title=Legend\r\n\r\nlegendItems.Manual_Allocated_Billed=Manual, Allocated, Billed\r\nlegendItems.Manual_Allocated_NotBilled=Manual, Allocated, Billed\r\nlegendItems.Manual_NotAllocated_Billed=Manual, Not Allocated, Billed\r\nlegendItems.Manual_NotAllocated_NotBilled=Manual, Not Allocated, Not Billed\r\nlegendItems.WorkItem_Allocated_Billed=WorkItem, Allocated, Billed\r\nlegendItems.WorkItem_Allocated_NotBilled=WorkItem, Allocated, Not Billed\r\nlegendItems.WorkItem_NotAllocated_Billed=WorkItem, Not Allocated, Billed\r\nlegendItems.WorkItem_NotAllocated_NotBilled=WorkItem, Not Allocated, Not Billed\r\nlegendItems.Event_Allocated_Billed=Event, Allocated, Billed\r\nlegendItems.Event_Allocated_NotBilled=Event, Allocated, Not Billed\r\nlegendItems.Event_NotAllocated_Billed=Event, Not Allocated, Billed\r\nlegendItems.Event_NotAllocated_NotBilled=Event, Not Allocated, Not Billed\r\n\r\ncalendar.dayView=Day\r\ncalendar.weekView=Week\r\ncalendar.workWeekView=Work Week\r\ncalendar.monthView=Month\r\n\r\nOK=OK\r\nclose=Close\r\n\r\nWorkItems.ID=ID\r\nWorkItems.assignedTo=Assigned To\r\nWorkItems.assignedToName=Assigned To Name\r\nWorkItems.changedDate=Changed Date\r\nWorkItems.createdDate=Created Date\r\nWorkItems.reason=Reason\r\nWorkItems.state=State\r\nWorkItems.teamProject=Team Project\r\nWorkItems.title=Title\r\nWorkItems.workItemType=Type\r\n\r\nWorkItems.completedWork=Completed Work\r\nWorkItems.remainingWork=Remaining Work\r\nWorkItems.originalEstimate=Original Estimate\r\n\r\nWorkItems.activatedDate=Activated Date\r\nWorkItems.resolvedDate=Resolved Date\r\nWorkItems.completedDate=Completed Date\r\nWorkItems.closedDate=Closed Date\r\n\r\nWorkItems.customer=Customer\r\nWorkItems.type=Type\r\nWorkItems.private=Private\r\nWorkItems.project=Project\r\nWorkItems.workPackage=Package\r\nWorkItems.ticket=Ticket\r\n\r\nappointmentDialog.invalidInput=Please fill-in all\r\n\r\nmessage.allDayEventsAreNotEditable=All-day events cannot be edited.",
  "iot/singleplanningcalendar/localService/mockserver.js": function () {
    sap.ui.define(
      [
        "sap/ui/core/util/MockServer",
        "sap/ui/model/json/JSONModel",
        "sap/base/util/UriParameters",
        "sap/base/Log",
      ],
      function (e, t, r, a) {
        "use strict";
        var o,
          i = "iot.singleplanningcalendar/",
          n = i + "localService/mockdata";
        var s = {
          init: function (s) {
            var u = s || {};
            return new Promise(function (s, c) {
              var p = sap.ui.require.toUrl(i + "manifest.json"),
                l = new t(p);
              l.attachRequestCompleted(function () {
                var t = new r(window.location.href),
                  c = sap.ui.require.toUrl(n),
                  p = l.getProperty("/sap.app/dataSources/mainService"),
                  f = sap.ui.require.toUrl(i + p.settings.localUri),
                  d =
                    p.uri &&
                    new URI(p.uri)
                      .absoluteTo(sap.ui.require.toUrl(i))
                      .toString();
                if (!o) {
                  o = new e({ rootUri: d });
                } else {
                  o.stop();
                }
                e.config({
                  autoRespond: true,
                  autoRespondAfter: u.delay || t.get("serverDelay") || 500,
                });
                o.simulate(f, {
                  sMockdataBaseUrl: c,
                  bGenerateMissingMockData: true,
                });
                var g = o.getRequests();
                var m = function (e, t, r) {
                  r.response = function (r) {
                    r.respond(
                      e,
                      { "Content-Type": "text/plain;charset=utf-8" },
                      t
                    );
                  };
                };
                if (u.metadataError || t.get("metadataError")) {
                  g.forEach(function (e) {
                    if (e.path.toString().indexOf("$metadata") > -1) {
                      m(500, "metadata Error", e);
                    }
                  });
                }
                var v = u.errorType || t.get("errorType"),
                  h = v === "badRequest" ? 400 : 500;
                if (v) {
                  g.forEach(function (e) {
                    m(h, v, e);
                  });
                }
                o.setRequests(g);
                o.start();
                a.info("Running the app with mock data");
                s();
              });
              l.attachRequestFailed(function () {
                var e = "Failed to load application manifest";
                a.error(e);
                c(new Error(e));
              });
            });
          },
          getMockServer: function () {
            return o;
          },
        };
        return s;
      }
    );
  },
  "iot/singleplanningcalendar/manifest.json":
    "{\"_version\":\"1.9.0\",\"sap.cloud\":{\"public\":true,\"service\":\"iot.project.planner\"},\"sap.app\":{\"id\":\"iot.singleplanningcalendar\",\"type\":\"application\",\"i18n\":\"i18n/i18n.properties\",\"applicationVersion\":{\"version\":\"1.0.1\"},\"title\":\"{{appTitle}}\",\"description\":\"{{appDescription}}\",\"resources\":\"resources.json\",\"ach\":\"ach\",\"dataSources\":{\"mainService\":{\"uri\":\"/v2/timetracking/\",\"type\":\"OData\"}},\"crossNavigation\":{\"inbounds\":{\"iot-singleplanningcalendar-inbound\":{\"signature\":{\"parameters\":{},\"additionalParameters\":\"allowed\"},\"semanticObject\":\"SinglePlanningCalendar\",\"action\":\"manage\",\"title\":\"{{appTitle}}\",\"subTitle\":\"{{appSubtitle}}\",\"icon\":\"sap-icon://calendar\"}}}},\"sap.ui\":{\"technology\":\"UI5\",\"icons\":{\"icon\":\"sap-icon://task\",\"favIcon\":\"\",\"phone\":\"\",\"phone@2\":\"\",\"tablet\":\"\",\"tablet@2\":\"\"},\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true}},\"sap.ui5\":{\"flexEnabled\":false,\"rootView\":{\"viewName\":\"iot.singleplanningcalendar.view.SinglePlanningCalendar\",\"type\":\"XML\",\"async\":true,\"id\":\"SinglePlanningCalendar\"},\"dependencies\":{\"minUI5Version\":\"1.66.0\",\"libs\":{\"sap.ui.core\":{},\"sap.m\":{},\"sap.ui.layout\":{}}},\"contentDensities\":{\"compact\":true,\"cozy\":true},\"models\":{\"i18n\":{\"type\":\"sap.ui.model.resource.ResourceModel\",\"settings\":{\"bundleName\":\"iot.singleplanningcalendar.i18n.i18n\"}},\"OData\":{\"dataSource\":\"mainService\",\"type\":\"sap.ui.model.odata.v2.ODataModel\",\"settings\":{\"defaultUpdateMethod\":\"MERGE\",\"defaultOperationMode\":\"Server\",\"defaultBindingMode\":\"TwoWay\",\"refreshAfterChange\":false,\"defaultCountMode\":\"None\"}}},\"resources\":{\"css\":[{\"uri\":\"css/style.css\"}]},\"routing\":{\"config\":{\"routerClass\":\"sap.m.routing.Router\",\"viewType\":\"XML\",\"async\":true,\"viewPath\":\"iot.singleplanningcalendar.view\",\"controlAggregation\":\"pages\",\"controlId\":\"app\",\"clearControlAggregation\":false},\"routes\":[{\"name\":\"RouteSinglePlanningCalendar\",\"pattern\":\"RouteSinglePlanningCalendar\",\"target\":[\"TargetSinglePlanningCalendar\"]}],\"targets\":{\"TargetSinglePlanningCalendar\":{\"viewType\":\"XML\",\"transition\":\"slide\",\"clearControlAggregation\":false,\"viewId\":\"SinglePlanningCalendar\",\"viewName\":\"SinglePlanningCalendar\"}}}}}",
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
    sap.ui.define(
      ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
      function (e, n) {
        "use strict";
        return {
          createDeviceModel: function () {
            var i = new e(n);
            i.setDefaultBindingMode("OneWay");
            return i;
          },
        };
      }
    );
  },
  "iot/singleplanningcalendar/view/SinglePlanningCalendar.view.xml":
    "<mvc:View controllerName=\"iot.singleplanningcalendar.controller.SinglePlanningCalendar\"\r\n\txmlns=\"sap.m\"\r\n\txmlns:unified=\"sap.ui.unified\"\r\n\txmlns:form=\"sap.ui.layout.form\"\r\n\txmlns:core=\"sap.ui.core\"\r\n\txmlns:l=\"sap.ui.layout\"\r\n\txmlns:smartfield=\"sap.ui.comp.smartfield\"\r\n\txmlns:mvc=\"sap.ui.core.mvc\" displayBlock=\"true\"><Shell id=\"shell\"><App id=\"app\" busy=\"{/busy}\" busyIndicatorDelay=\"0\"><pages><Page showHeader=\"false\"><SinglePlanningCalendar id=\"SPCalendar\" appointments=\"{/appointments}\" appointmentSelect=\"onPressAppointment\" appointmentCreate=\"onCreateAppointment\" appointmentResize=\"onEditAppointment\" appointmentDrop=\"onEditAppointment\" startDateChange=\"onStartDateChange\" viewChange=\"onChangeView\" startHour=\"7\" endHour=\"20\" fullDay=\"false\" enableAppointmentsCreate=\"true\" enableAppointmentsResize=\"true\" enableAppointmentsDragAndDrop=\"true\"><actions><Button id=\"createAppointment\" text=\"{i18n>createAppointment.button.text}\" press=\"onCreateAppointment\" tooltip=\"{i18n>createAppointment.button.tooltip}\" /><Button id=\"displayLegend\" text=\"{i18n>displayLegend.button.text}\" press=\"onDisplayLegend\" tooltip=\"{i18n>displayLegend.button.tooltip}\" /></actions><appointments><unified:CalendarAppointment startDate=\"{activatedDate}\" endDate=\"{completedDate}\" title=\"{ticket} {title}\" text=\"{customer_friendlyID} {project_friendlyID}\" type=\"{parts: ['type', 'project_friendlyID', 'status'], formatter: '.formatter.getDisplayType'}\" icon=\"{path: 'customer_friendlyID', formatter: '.formatter.getIconURL'}\" tentative=\"{= !${confirmed}}\"/></appointments><dependents><Dialog id=\"createItemDialog\" busy=\"{/dialogBusy}\" afterClose=\"onAfterCloseDialog\" afterOpen=\"onAfterOpenDialog\"><customHeader><Bar><contentLeft><Title text=\"{/createItemDialogTitle} {= !${confirmed} ? ${i18n>appointmentDialog.draftIndicator} : ''}\"/></contentLeft><contentRight><Button press=\"onPressResetAppointment\" text=\"{i18n>resetEntry.button.text}\" tooltip=\"{i18n>resetEntry.button.tooltip}\" enabled=\"{= !!${confirmed} &amp;&amp; !${isAllDay}}\"/><Button press=\"onPressDeleteAppointment\" text=\"{i18n>deleteEntry.button.text}\" tooltip=\"{i18n>deleteEntry.button.tooltip}\" enabled=\"{= !${isAllDay}}\"/></contentRight></Bar></customHeader><form:SimpleForm editable=\"true\" layout=\"ResponsiveGridLayout\"><MessageStrip text=\"{i18n>message.allDayEventsAreNotEditable}\" visible=\"{= !!${isAllDay}}\"/><Label text=\"{i18n>WorkItems.title}\" required=\"true\"/><Input value=\"{title}\"/><Label text=\"{i18n>WorkItems.customer}\" required=\"true\"/><ComboBox id=\"customerSelect\" selectedKey=\"{customer_ID}\" items=\"{path: '/customers', sorter: {path: 'name'}}\" selectionChange=\"onSelectCustomer\"><items><core:Item text=\"{name}\" key=\"{ID}\"/></items></ComboBox><Label text=\"{i18n>WorkItems.project}\" required=\"true\"/><Select id=\"projectSelect\" selectedKey=\"{project_ID}\" items=\"{path: '/projectsFiltered', sorter: {path: 'title'}}\" change=\"onSelectProject\" forceSelection=\"false\"><items><core:Item text=\"{title}\" key=\"{ID}\"/></items></Select><Label text=\"{i18n>WorkItems.workPackage}\"/><Select id=\"packageSelect\" selectedKey=\"{workPackage_ID}\" items=\"{path: '/workPackagesFiltered', sorter: {path: 'title'}}\" change=\"onSelectPackage\" forceSelection=\"false\"><items><core:Item text=\"{title}\" key=\"{ID}\"/></items></Select><Label text=\"{i18n>WorkItems.ticket}\"/><Input value=\"{ticket}\"/><Label text=\"{i18n>WorkItems.activatedDate}\"/><DateTimePicker value=\"{path:'activatedDate', type:'sap.ui.model.type.DateTime', formatOptions: {style: 'short'}}\" minutesStep=\"15\"/><Label text=\"{i18n>WorkItems.completedDate}\"/><DateTimePicker value=\"{path: 'completedDate', type:'sap.ui.model.type.DateTime', formatOptions: {style: 'short'}}\" minutesStep=\"15\"/></form:SimpleForm><buttons><Button id=\"submitButton\" text=\"{i18n>OK}\" press=\"onSubmitEntry\" enabled=\"{= !!${title} &amp;&amp; !!${customer_ID} &amp;&amp; !!${project_ID} &amp;&amp; !${isAllDay}}\" type=\"Emphasized\"/><Button text=\"{i18n>close}\" press=\"onCloseDialog\" /></buttons></Dialog><Dialog id=\"legendDialog\" title=\"{i18n>legend.title}\"><PlanningCalendarLegend id=\"singlePlanningCalendarLegend\" items=\"{path : '/legendItems', templateShareable: true}\" class=\"sapUiSmallMarginTop\"><items><unified:CalendarLegendItem text=\"{text}\" type=\"{type}\" /></items></PlanningCalendarLegend><buttons><Button text=\"{i18n>close}\" press=\"onCloseDialog\" /></buttons></Dialog></dependents><views><SinglePlanningCalendarDayView key=\"Day\" id=\"dayView\" title=\"{i18n>calendar.dayView}\" /><SinglePlanningCalendarWorkWeekView key=\"WorkWeek\" title=\"{i18n>calendar.workWeekView}\" /><SinglePlanningCalendarWeekView key=\"Week\" title=\"{i18n>calendar.weekView}\"/><SinglePlanningCalendarMonthView key=\"Month\" id=\"monthView\" title=\"{i18n>calendar.monthView}\" /></views></SinglePlanningCalendar></Page></pages></App></Shell></mvc:View>",
});
