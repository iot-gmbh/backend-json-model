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
  (e, t, s, o, n, a, r, i) => {
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
        async onInit() {
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
              }),
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
            const s = $(document.activeElement)
              && $(document.activeElement).control()[0]
              && $(document.activeElement).control()[0].getId();
            if (t.ctrlKey) {
              if (t.keyCode === 13 && !this.byId("submitButton").getEnabled()) {
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
          this._getSelectControls().forEach((e) => e.getBinding("items").refresh());
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
          s.setProperty(`${d}/activatedDate`, n);
          s.setProperty(`${d}/completedDate`, a);
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
            o.ID ? s.getText("editAppointment") : s.getText("createAppointment"),
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
                "message.allDayEventsAreNotEditable",
              ),
            );
            return;
          }
          const { appointments: o } = e.getData();
          e.setProperty("/dialogBusy", true);
          const n = this.byId("projectSelect");
          const a = this.byId("packageSelect");
          s.project_ID = n.getItems().length > 0 ? n.getSelectedKey() : null;
          s.workPackage_ID = a.getItems().length > 0 ? a.getSelectedKey() : null;
          try {
            const t = await this._submitEntry(s);
            o[t.ID] = t;
            o.NEW = {};
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
          }
          return this.create({ path: "/MyWorkItems", data: e });
        },
        onAfterCloseDialog() {
          const e = this.byId("createItemDialog")
            .getBindingContext()
            .getObject();
          if (!e || !e.ID) this.getModel().setProperty("/appointments/NEW", {});
          this.byId("createItemDialog").unbindElement();
        },
        onCloseDialog(e) {
          e.getSource().getParent().close();
        },
        _closeDialog(e) {
          this.byId(e).close();
        },
        onChangeView() {
          this._loadAppointments();
        },
        onStartDateChange() {
          this._loadAppointments();
        },
        _getCalendarEndDate() {
          const e = this.byId("SPCalendar");
          const t = e.getStartDate();
          const s = e._getSelectedView().getKey();
          const o = {
            Day: 1, WorkWeek: 5, Week: 7, Month: 31,
          };
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
                  new s({ path: "completedDate", operator: "GT", value1: n }),
                  new s({ path: "activatedDate", operator: "LE", value1: a }),
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
            urlParameters: { $expand: "project/customer,project/workPackages" },
          });
          const n = [];
          const a = [];
          const r = [];
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
        _getUser() {
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
      },
    );
  },
);
