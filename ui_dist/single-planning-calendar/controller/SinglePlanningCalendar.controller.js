const nest = (t, e = null, s = "parent_ID") =>
  t.filter((t) => t[s] === e).map((e) => ({ ...e, children: nest(t, e.ID) }));
const capitalizeFirstLetter = (t) => t.charAt(0).toUpperCase() + t.slice(1);
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
  (t, e, s, a, n, o, r, i) => {
    function c(t, e) {
      const s = new Date(t);
      s.setDate(s.getDate() + e);
      return s;
    }
    function l() {
      const t = new Date(new Date().setHours(0, 0, 0, 1));
      const e = t.getDay();
      const s = t.getDate() - e + (e === 0 ? -6 : 1);
      return new Date(t.setDate(s));
    }
    return t.extend(
      "iot.singleplanningcalendar.controller.SinglePlanningCalendar",
      {
        formatter: a,
        async onInit() {
          const t = this.getResourceBundle();
          const s = this.byId("SPCalendar");
          const a = s.getViews()[1];
          const c = new n({
            appointments: { NEW: {} },
            busy: false,
            categories: {},
            hierarchySuggestion: "",
            legendItems: Object.entries(o.getItems()).map(
              ([e, { type: s }]) => ({
                text: t.getText(`legendItems.${e}`),
                type: s,
              })
            ),
          });
          s.setSelectedView(a);
          s.setStartDate(l());
          c.setSizeLimit(300);
          this.setModel(c);
          await this.getModel("OData").metadataLoaded();
          try {
            await Promise.all([
              this._loadAppointments(),
              this._loadHierarchy(),
            ]);
          } catch (t) {
            r.error(e.parse(t));
          }
          $(document).keydown((e) => {
            const s =
              $(document.activeElement) &&
              $(document.activeElement).control()[0] &&
              $(document.activeElement).control()[0].getId();
            if (e.ctrlKey) {
              if (e.keyCode === 13 && !this.byId("submitButton").getEnabled()) {
                i.show(t.getText("appointmentDialog.invalidInput"));
                return;
              }
              if (e.keyCode === 13 && s && !s.includes("submitButton")) {
                e.preventDefault();
                this.onSubmitEntry();
              } else if (e.keyCode === 46) {
                e.preventDefault();
                const t = sap.ui.getCore().byId(s);
                const a = t.getBindingContext().getObject();
                this._deleteAppointment(a);
              }
            }
          });
          this.byId("hierarchySearch").setFilterFunction((t, e) =>
            e.getText().match(new RegExp(t, "i"))
          );
        },
        onSelectHierarchy(t) {
          const { listItem: e } = t.getParameters();
          const s = e.getBindingContext().getProperty("path");
          const a = t.getSource().getBindingContext().getPath();
          this.getModel().setProperty(`${a}/parentPath`, s);
        },
        onDisplayLegend() {
          this.byId("legendDialog").open();
        },
        onPressAppointment(t) {
          const { appointment: e } = t.getParameters();
          if (e) {
            this._bindAndOpenDialog(e.getBindingContext().getPath());
          }
        },
        async onEditAppointment(t) {
          const e = this.getModel();
          const { categories: s } = e.getData();
          const {
            startDate: a,
            endDate: n,
            appointment: o,
            copy: r,
          } = t.getParameters();
          const i = o.getBindingContext();
          const c = i.getObject();
          let l = i.getPath();
          if (r) {
            l = "/appointments/NEW";
            e.setProperty("/appointments/NEW", o);
          }
          e.setProperty(`${l}/activatedDate`, a);
          e.setProperty(`${l}/completedDate`, n);
          if (!c.parentPath) {
            this._bindAndOpenDialog(l);
            return;
          }
          this._submitEntry({ ...c, activatedDate: a, completedDate: n });
        },
        onPressDeleteAppointment(t) {
          const e = t.getSource().getBindingContext().getObject();
          this._deleteAppointment(e);
        },
        async _deleteAppointment(t) {
          const s = this.getModel();
          const { appointments: a } = s.getData();
          s.setProperty("/dialogBusy", true);
          try {
            await this.remove({
              path: `/MyWorkItems(ID='${encodeURIComponent(t.ID)}')`,
              data: t,
            });
            delete a[t.ID];
            this._closeDialog("createItemDialog");
          } catch (t) {
            r.error(e.parse(t));
          }
          s.setProperty("/dialogBusy", false);
        },
        async onPressResetAppointment(t) {
          const s = this.getModel();
          const { appointments: a } = s.getData();
          const n = t.getSource().getBindingContext().getObject();
          s.setProperty("/dialogBusy", true);
          try {
            const t = await this.reset({
              path: `/MyWorkItems(ID='${encodeURIComponent(n.ID)}')`,
              data: n,
            });
            a[t.ID] = t;
            await this._loadAppointments();
            this._closeDialog("createItemDialog");
          } catch (t) {
            r.error(e.parse(t));
          }
          s.setProperty("/dialogBusy", false);
        },
        onCreateAppointment(t) {
          this._createAppointment(t);
          this._bindAndOpenDialog("/appointments/NEW");
        },
        _createAppointment(t) {
          const e = this.getModel();
          const { startDate: s, endDate: a } = t.getParameters();
          const n = { activatedDate: s, completedDate: a, hierarchy: {} };
          e.setProperty("/appointments/NEW", n);
        },
        _bindAndOpenDialog(t) {
          const e = this.getModel();
          const s = this.getResourceBundle();
          const a = e.getProperty(t);
          const n = this.byId("createItemDialog");
          e.setProperty(
            "/createItemDialogTitle",
            a.ID ? s.getText("editAppointment") : s.getText("createAppointment")
          );
          this._filterHierarchyByPath(a.parentPath);
          n.bindElement(t);
          n.open();
        },
        onChangeHierarchy(t) {
          const { newValue: e } = t.getParameters();
          this._filterHierarchyByPath(e);
        },
        _filterHierarchyByPath(t) {
          const e = [
            new s({
              path: "path",
              test: (e) => {
                if (!t) return false;
                const s = t.split(" ");
                return s
                  .map((t) => t.toUpperCase())
                  .every((t) => e.includes(t));
              },
            }),
          ];
          this.byId("hierarchyTree").getBinding("items").filter(e);
        },
        async onSubmitEntry() {
          const t = this.getModel();
          const e = this.byId("createItemDialog")
            .getBindingContext()
            .getObject();
          if (e.isAllDay) {
            i.show(
              this.getResourceBundle().getText(
                "message.allDayEventsAreNotEditable"
              )
            );
            return;
          }
          t.setProperty("/dialogBusy", true);
          await this._submitEntry(e);
          t.setProperty("/dialogBusy", false);
          this._closeDialog("createItemDialog");
        },
        async _submitEntry(t) {
          const s = this.getModel();
          const { appointments: a, categoriesFlat: n } = s.getData();
          const { hierarchy: o, ...i } = t;
          const c = n.find((e) => e.path === t.parentPath);
          i.parentPath = undefined;
          i.parent_ID = c.ID;
          let l;
          try {
            if (t.ID) {
              const e = `/MyWorkItems(ID='${encodeURIComponent(t.ID)}')`;
              l = await this.update({ path: e, data: i });
            } else {
              l = await this.create({ path: "/MyWorkItems", data: i });
            }
            l.parentPath = t.parentPath;
            l.tags = t.tags;
            a[l.ID] = l;
            a.NEW = {};
            s.setProperty("/appointments", a);
          } catch (t) {
            r.error(e.parse(t));
          }
        },
        onCloseDialog(t) {
          t.getSource().getParent().close();
        },
        _closeDialog(t) {
          this.byId(t).close();
        },
        onAfterCloseDialog() {
          this.getModel().setProperty("/appointments/NEW", {});
        },
        onChangeView() {
          this._loadAppointments();
        },
        onStartDateChange() {
          this._loadAppointments();
        },
        onUpdateTags(t) {
          const e = this.getModel();
          const s = t.getSource();
          const a = s.getBindingContext().getPath();
          this._removeDuplicateTokens(s);
          const n = s.getTokens().map((t) => ({ tag_title: t.getKey() }));
          e.setProperty(`${a}/tags`, n);
          this._suggestCategory(n);
        },
        async _suggestCategory(t) {
          const e = t.map(({ tag_title: t }) => t).join(" ");
          const { results: s } = await this.read({
            path: "/MatchCategory2Tags",
            urlParameters: { $search: e },
          });
          this.getModel().setProperty(
            "/hierarchySuggestion",
            s[0] ? s[0].categoryTitle : ""
          );
        },
        _removeDuplicateTokens(t) {
          const e = t.getTokens();
          const s = {};
          e.forEach((t) => {
            const e = t.getText();
            s[e] = t;
          });
          t.setTokens(Object.values(s));
        },
        onDeleteToken(t) {
          const e = t.getSource();
          const s = e.getParent();
          s.removeToken(e);
        },
        _getCalendarEndDate() {
          const t = this.byId("SPCalendar");
          const e = t.getStartDate();
          const s = t._getSelectedView().getKey();
          const a = { Day: 1, WorkWeek: 5, Week: 7, Month: 31 };
          const n = a[s];
          const o = c(e, n);
          return o;
        },
        async _loadAppointments() {
          const t = this.getModel();
          const e = this.byId("SPCalendar");
          const a = t.getProperty("/appointments");
          const n = e.getStartDate();
          const o = this._getCalendarEndDate();
          t.setProperty("/busy", true);
          const { results: r } = await this.read({
            path: "/MyWorkItems",
            urlParameters: { $top: 100, $expand: "tags" },
            filters: [
              new s({
                filters: [
                  new s({ path: "completedDate", operator: "GT", value1: n }),
                  new s({ path: "activatedDate", operator: "LE", value1: o }),
                ],
                and: true,
              }),
            ],
          });
          const i = r.reduce((t, e) => {
            const s = e.tags.results;
            t[e.ID] = {
              completedDate: e.isAllDay
                ? e.completedDate.setHours(0)
                : e.completedDate,
              activatedDate: e.isAllDay
                ? e.activatedDate.setHours(0)
                : e.activatedDate,
              ...e,
              tags: s,
            };
            return t;
          }, {});
          t.setProperty("/appointments", { ...a, ...i });
          t.setProperty("/busy", false);
        },
        async _loadHierarchy() {
          const t = this.getModel();
          t.setProperty("/busy", true);
          const [{ results: e }] = await Promise.all([
            this.read({ path: "/MyCategories" }),
          ]);
          const s = nest(e);
          t.setProperty("/categoriesNested", s);
          t.setProperty("/MyCategories", e);
          t.setProperty("/busy", false);
        },
        _getUser() {
          return new Promise((t, e) => {
            this.getModel("OData").read("/MyUser", {
              success: (s) => {
                const a = s.results[0];
                if (!a)
                  e(new Error("User does not exist in DB. Please create it."));
                return t(a);
              },
            });
          });
        },
      }
    );
  }
);
