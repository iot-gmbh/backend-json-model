/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const nest = (items, ID = null, link = "parent_ID") =>
  items
    .filter((item) => item[link] === ID)
    .map((item) => ({ ...item, children: nest(items, item.ID) }));

const reduce = (nestedArray) =>
  nestedArray.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.ID]: { ...curr, children: reduce(curr.children) },
    }),
    {}
  );

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const createDeepPath = (depth, hierarchy) => {
  let path = `/categories`;

  for (let i = 1; i <= depth; i += 1) {
    path += `/${hierarchy[`level${i - 1}`]}/children`;
  }

  return path;
};

sap.ui.define(
  [
    "./BaseController",
    "./ErrorParser",
    "sap/ui/model/Filter",
    "../model/formatter",
    "sap/ui/core/Item",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label",
    "../model/legendItems",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Select",
  ],
  (
    BaseController,
    ErrorParser,
    Filter,
    formatter,
    Item,
    JSONModel,
    Label,
    legendItems,
    MessageBox,
    MessageToast,
    Select
  ) => {
    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    function getMondayMorning() {
      const date = new Date(new Date().setHours(0, 0, 0, 1));
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(date.setDate(diff));
    }

    return BaseController.extend(
      "iot.singleplanningcalendar.controller.SinglePlanningCalendar",
      {
        formatter,

        async onInit() {
          const bundle = this.getResourceBundle();
          const calendar = this.byId("SPCalendar");
          const workWeekView = calendar.getViews()[1];
          const dialog = this.byId("createItemDialog");

          const model = new JSONModel({
            appointments: { NEW: {} },
            busy: false,
            categories: {},
            legendItems: Object.entries(legendItems.getItems()).map(
              ([key, { type }]) => ({
                text: bundle.getText(`legendItems.${key}`),
                type,
              })
            ),
          });

          calendar.setSelectedView(workWeekView);
          calendar.setStartDate(getMondayMorning());

          // Otherwise new entries won't be displayed in the calendar
          model.setSizeLimit(300);

          this.setModel(model);

          await this.getModel("OData").metadataLoaded();

          try {
            await Promise.all([
              this._loadAppointments(),
              this._loadHierarchy(),
            ]);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          $(document).keydown((evt) => {
            const activeElementID =
              $(document.activeElement) &&
              $(document.activeElement).control()[0] &&
              $(document.activeElement).control()[0].getId();

            if (evt.ctrlKey) {
              if (
                evt.keyCode === 13 &&
                !this.byId("submitButton").getEnabled()
              ) {
                MessageToast.show(
                  bundle.getText("appointmentDialog.invalidInput")
                );
                return;
              }
              if (
                evt.keyCode === 13 &&
                activeElementID &&
                // Check the active element in order to prevent double-submit
                !activeElementID.includes("submitButton")
              ) {
                evt.preventDefault();

                this.onSubmitEntry();
              } else if (evt.keyCode === 46) {
                evt.preventDefault();

                const appointmentControl = sap.ui
                  .getCore()
                  .byId(activeElementID);
                const appointment = appointmentControl
                  .getBindingContext()
                  .getObject();

                this._deleteAppointment(appointment);
              }
            }
          });
        },

        onDisplayLegend() {
          this.byId("legendDialog").open();
        },

        onPressAppointment(event) {
          const { appointment } = event.getParameters();

          if (appointment) {
            this._bindAndOpenDialog(appointment.getBindingContext().getPath());
          }
        },

        async onEditAppointment(event) {
          const model = this.getModel();
          const { appointments } = model.getData();
          const { startDate, endDate, appointment, copy } =
            event.getParameters();
          const bindingContext = appointment.getBindingContext();
          const data = bindingContext.getObject();

          let path = bindingContext.getPath();

          if (copy) {
            path = "/appointments/NEW";
            model.setProperty("/appointments/NEW", appointment);
          }

          model.setProperty(`${path}/activatedDate`, startDate);
          model.setProperty(`${path}/completedDate`, endDate);

          if (!data.parent_ID) {
            this._bindAndOpenDialog(path);
            return;
          }

          this._submitEntry({
            ...data,
            activatedDate: startDate,
            completedDate: endDate,
          });
        },

        onPressDeleteAppointment(event) {
          const appointment = event.getSource().getBindingContext().getObject();

          this._deleteAppointment(appointment);
        },

        async _deleteAppointment(appointment) {
          const model = this.getModel();
          const { appointments } = model.getData();

          model.setProperty("/dialogBusy", true);

          try {
            await this.remove({
              path: `/MyWorkItems(ID='${encodeURIComponent(appointment.ID)}')`,
              data: appointment,
            });

            delete appointments[appointment.ID];

            this._closeDialog("createItemDialog");
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          model.setProperty("/dialogBusy", false);
        },

        async onPressResetAppointment(event) {
          const model = this.getModel();
          const { appointments } = model.getData();
          const appointment = event.getSource().getBindingContext().getObject();

          model.setProperty("/dialogBusy", true);

          try {
            const appointmentSync = await this.reset({
              path: `/MyWorkItems(ID='${encodeURIComponent(appointment.ID)}')`,
              appointment,
            });

            appointments[appointmentSync.ID] = appointmentSync;

            this._closeDialog("createItemDialog");
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          model.setProperty("/dialogBusy", false);
        },

        onCreateAppointment(event) {
          this._createAppointment(event);
          this._bindAndOpenDialog("/appointments/NEW");
        },

        _createAppointment(event) {
          const model = this.getModel();
          const { startDate, endDate } = event.getParameters();
          const appointment = {
            activatedDate: startDate,
            completedDate: endDate,
            hierarchy: {},
          };

          model.setProperty("/appointments/NEW", appointment);
        },

        _bindAndOpenDialog(path) {
          const model = this.getModel();
          const bundle = this.getResourceBundle();
          const appointment = model.getProperty(path);
          const dialog = this.byId("createItemDialog");

          model.setProperty(
            "/createItemDialogTitle",
            appointment.ID
              ? bundle.getText("editAppointment")
              : bundle.getText("createAppointment")
          );

          this._bindHierarchyInputs(appointment);

          dialog.bindElement(path);
          dialog.open();
        },

        _bindHierarchyInputs(appointment) {
          const { hierarchy } = appointment;
          if (!hierarchy) return;

          const model = this.getModel();
          const hierarchyDepth = model.getProperty("/hierarchyDepth");

          for (let i = 0; i <= hierarchyDepth; i += 1) {
            const variableName = `level${i}`;

            if (hierarchy[variableName] || i === 0) {
              this._bindSelectControl(
                `select${capitalizeFirstLetter(variableName)}`,
                createDeepPath(i, hierarchy)
              );
            }
          }
        },

        _bindSelectControl(controlID, path) {
          const selectControl = this.byId(controlID);

          selectControl.bindItems({
            path,
            template: new Item({ text: "{title}", key: "{ID}" }),
          });
        },

        async onSubmitEntry() {
          const model = this.getModel();
          const appointment = this.byId("createItemDialog")
            .getBindingContext()
            .getObject();

          if (appointment.isAllDay) {
            MessageToast.show(
              this.getResourceBundle().getText(
                "message.allDayEventsAreNotEditable"
              )
            );
            return;
          }

          model.setProperty("/dialogBusy", true);

          await this._submitEntry(appointment);

          model.setProperty("/dialogBusy", false);
          this._closeDialog("createItemDialog");
        },

        async _submitEntry(appointment) {
          const { hierarchy, ...data } = appointment;

          const model = this.getModel();
          const { appointments, hierarchyDepth } = model.getData();
          let hierarchy_parent = "";

          for (let i = hierarchyDepth; i >= 0; i -= 1) {
            if (hierarchy[`level${i}`]) {
              hierarchy_parent = hierarchy[`level${i}`];
              break;
            }
          }

          data.hierarchy_parent = hierarchy_parent;
          let appointmentSync;

          try {
            // Update
            if (appointment.ID) {
              const path = `/MyWorkItems(ID='${encodeURIComponent(
                appointment.ID
              )}')`;

              appointmentSync = await this.update({
                path,
                data,
              });
            } else {
              appointmentSync = await this.create({
                path: "/MyWorkItems",
                data,
              });
            }

            appointmentSync.hierarchy = appointment.hierarchy;
            appointments[appointmentSync.ID] = appointmentSync;
            appointments.NEW = {};

            model.setProperty("/appointments", appointments);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }
        },

        onCloseDialog(event) {
          event.getSource().getParent().close();
        },

        _closeDialog(dialogName) {
          this.byId(dialogName).close();
        },

        onChangeView() {
          this._loadAppointments();
        },

        onStartDateChange() {
          this._loadAppointments();
        },

        _getCalendarEndDate() {
          const calendar = this.byId("SPCalendar");
          const startDate = calendar.getStartDate();
          const selectedView = calendar._getSelectedView().getKey();

          const mapDaysToAdd = {
            Day: 1,
            WorkWeek: 5,
            Week: 7,
            // Sicher ist sicher, im Zweifel zu viele Daten laden => 31 Tage
            Month: 31,
          };

          const daysToAdd = mapDaysToAdd[selectedView];
          const endDate = addDays(startDate, daysToAdd);

          return endDate;
        },

        async _loadAppointments() {
          const model = this.getModel();
          const calendar = this.byId("SPCalendar");
          const appointmentsOld = model.getProperty("/appointments");
          const startDate = calendar.getStartDate();
          const endDate = this._getCalendarEndDate();

          model.setProperty("/busy", true);

          const { results: appointments } = await this.read({
            path: "/MyWorkItems",
            urlParameters: { $top: 100, $expand: "hierarchy" },
            filters: [
              new Filter({
                filters: [
                  new Filter({
                    path: "completedDate",
                    operator: "GT",
                    value1: startDate,
                  }),
                  new Filter({
                    path: "activatedDate",
                    operator: "LE",
                    value1: endDate,
                  }),
                ],
                and: true,
              }),
            ],
          });

          const appointmentsMap = appointments.reduce((map, appointment) => {
            // eslint-disable-next-line no-param-reassign
            map[appointment.ID] = {
              /* Trick, to get the dates right: Somehow all-day events start and end at 02:00 instead of 00:00.
                This leads to problems with UI5, because the events are repeated each day which is ugly
                TODO: Find a better solution. Maybe this thread can help: https://answers.sap.com/questions/13324088/why-cap-shows-datetime-field-different-in-fiori-db.html
              */
              completedDate: appointment.isAllDay
                ? appointment.completedDate.setHours(0)
                : appointment.completedDate,
              activatedDate: appointment.isAllDay
                ? appointment.activatedDate.setHours(0)
                : appointment.activatedDate,
              ...appointment,
            };

            return map;
          }, {});

          model.setProperty("/appointments", {
            ...appointmentsOld,
            ...appointmentsMap,
          });

          model.setProperty("/busy", false);
        },

        async _loadHierarchy() {
          const model = this.getModel();

          model.setProperty("/busy", true);

          const [{ results: categories }, { results: hierarchyLevels }] =
            await Promise.all([
              this.read({
                path: "/MyCategories",
              }),
              this.read({
                path: "/HierarchyLevels",
              }),
            ]);

          const categoriesMap = reduce(nest(categories));
          const hierarchyDepth = Math.max(
            ...categories.map(({ hierarchyLevel }) => hierarchyLevel)
          );

          const simpleForm = this.byId("appointmentSimpleForm");
          const insertAtContentIndex = 3;

          hierarchyLevels.forEach(({ hierarchyLevel, title }, i) => {
            simpleForm.insertContent(
              new Label({ text: title }),
              insertAtContentIndex + i * 2
            );
            simpleForm.insertContent(
              new Select({
                selectedKey: `{hierarchy/level${hierarchyLevel}}`,
                id: this.getView().createId(`selectLevel${hierarchyLevel}`),
                forceSelection: false,
                change: (event) => {
                  const selectedItem = event.getParameter("selectedItem");
                  const path = selectedItem?.getBindingContext().getPath();

                  if (hierarchyLevel < hierarchyDepth) {
                    this._bindSelectControl(
                      `selectLevel${hierarchyLevel + 1}`,
                      `${path}/children`
                    );
                  }
                },
              }),
              insertAtContentIndex + i * 2 + 1
            );
          });

          model.setProperty("/hierarchyDepth", hierarchyDepth);
          model.setProperty("/categories", categoriesMap);
          model.setProperty("/busy", false);
        },

        _getUser() {
          return new Promise((resolve, reject) => {
            this.getModel("OData").read("/MyUser", {
              success: (response) => {
                const myUser = response.results[0];
                if (!myUser)
                  reject(
                    new Error("User does not exist in DB. Please create it.")
                  );
                return resolve(myUser);
              },
            });
          });
        },
      }
    );
  }
);
