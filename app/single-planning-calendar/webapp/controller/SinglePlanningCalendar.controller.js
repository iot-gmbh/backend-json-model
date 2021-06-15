/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* globals $ */
sap.ui.define(
  [
    "./BaseController",
    "./ErrorParser",
    "sap/ui/model/Filter",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "../model/legendItems",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    ErrorParser,
    Filter,
    formatter,
    JSONModel,
    legendItems,
    MessageBox
  ) {
    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    function getMondayMorning() {
      const date = new Date(new Date().setHours(0, 0, 0, 1));
      const day = date.getDay();
      const diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
      return new Date(date.setDate(diff));
    }

    return BaseController.extend(
      "iot.singleplanningcalendar.controller.SinglePlanningCalendar",
      {
        formatter,

        onInit: async function () {
          const bundle = this.getResourceBundle();
          const calendar = this.byId("SPCalendar");
          const workWeekView = calendar.getViews()[1];

          const model = new JSONModel({
            appointments: { NEW: {} },
            busy: false,
            customers: [],
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
          model.setProperty("/busy", true);

          this.setModel(model);

          try {
            await Promise.all([
              this._loadAppointments(),
              this._loadCustomersAndProjects(),
            ]);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          model.setProperty("/busy", false);

          $(document).keydown((evt) => {
            const activeElementID =
              $(document.activeElement) &&
              $(document.activeElement).control()[0] &&
              $(document.activeElement).control()[0].getId();

            if (evt.ctrlKey) {
              if (
                evt.keyCode == 13 &&
                // Check the active element in order to prevent double-submit
                !activeElementID.includes("submitButton")
              ) {
                evt.preventDefault();
                this.onSubmitEntry();
              } else if (evt.keyCode === 46) {
                evt.preventDefault();

                const appointment = this.byId("createItemDialog")
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
          const path = appointment
            ? appointment.getBindingContext().getPath()
            : "/appointments/NEW";

          this._bindAndOpenDialog(path);
        },

        async onAppointmentResize(event) {
          const model = this.getModel();
          const { appointments } = model.getData();
          const { startDate, endDate, appointment } = event.getParameters();
          const bindingContext = appointment.getBindingContext();
          const data = bindingContext.getObject();
          const path = bindingContext.getPath();

          model.setProperty(path + "/activatedDate", startDate);
          model.setProperty(path + "/completedDate", endDate);

          if (!data.customer_friendlyID || !data.project_friendlyID) {
            this._bindAndOpenDialog(path);
            return;
          }

          try {
            // Remove customer & project (= Navigation-Props) from the object, so the getters won't be overwritten
            const { customer, project, ...appointmentSync } =
              await this._submitEntry({
                ...data,
                activatedDate: startDate,
                completedDate: endDate,
              });

            appointments[appointmentSync.ID] = Object.assign(
              data,
              appointmentSync
            );

            model.setProperty("/appointments", appointments);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }
        },

        async _deleteAppointment(appointment) {
          const model = this.getModel();
          const { appointments } = model.getData();

          model.setProperty("/dialogBusy", true);

          try {
            await this.remove({
              path: `/MyWorkItems('${encodeURIComponent(appointment.ID)}')`,
              data: appointment,
            });

            delete appointments[appointment.ID];

            this._closeDialog("createItemDialog");
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          model.setProperty("/dialogBusy", false);
        },

        onPressDeleteAppointment(event) {
          const appointment = event.getSource().getBindingContext().getObject();

          this._deleteAppointment(appointment);
        },

        async onPressResetAppointment(event) {
          const model = this.getModel();
          const { appointments } = model.getData();
          const appointment = event.getSource().getBindingContext().getObject();

          model.setProperty("/dialogBusy", true);

          try {
            // Remove customer & project (= Navigation-Props) from the object, so the getters won't be overwritten
            const { customer, project, ...appointmentSync } = await this.reset({
              path: `/MyWorkItems('${encodeURIComponent(appointment.ID)}')`,
              appointment,
            });

            appointments[appointmentSync.ID] = Object.define(
              appointment,
              appointmentSync
            );

            this._closeDialog("createItemDialog");
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          model.setProperty("/dialogBusy", false);
        },

        onCreateAppointment(event) {
          const model = this.getModel();
          const { customers } = model.getData();
          const { startDate, endDate } = event.getParameters();
          const appointment = {
            activatedDate: startDate,
            completedDate: endDate,
          };

          Object.defineProperty(appointment, "customer", {
            get: () =>
              customers.find(
                ({ friendlyID }) =>
                  friendlyID === appointment.customer_friendlyID
              ),
          });

          model.setProperty("/appointments/NEW", appointment);

          this._bindAndOpenDialog("/appointments/NEW");
        },

        _bindAndOpenDialog(path) {
          const model = this.getModel();
          const bundle = this.getResourceBundle();
          const appointment = model.getProperty(path);
          const dialog = this.byId("createItemDialog");

          const { customer } = appointment;

          if (customer) {
            if (customer.projects.length === 1) {
              model.setProperty(
                path + "/project_friendlyID",
                customer.projects[0].friendlyID
              );
            }
          } else model.setProperty(path + "/customer_friendlyID", undefined);

          // model.setProperty(path, appointment);
          model.setProperty(
            "/createItemDialogTitle",
            appointment.ID
              ? bundle.getText("editAppointment")
              : bundle.getText("createAppointment")
          );

          dialog.bindElement(path);
          dialog.open();
        },

        onSelectCustomer(event) {
          const model = this.getModel();
          const selectControl = event.getSource();
          const selectedItem = event.getParameter("selectedItem");

          if (!selectedItem) return;

          const appointmentPath = selectControl
            .getParent()
            .getBindingContext()
            .getPath();

          const customer = selectedItem.getBindingContext().getObject();
          const projects = customer.projects;

          model.setProperty(
            appointmentPath + "/customer_friendlyID",
            customer.friendlyID
          );

          if (projects.length >= 1) {
            model.setProperty(
              appointmentPath + "/project_friendlyID",
              projects[0].friendlyID
            );
          }
        },

        async onSubmitEntry() {
          const model = this.getModel();
          const appointment = this.byId("createItemDialog")
            .getBindingContext()
            .getObject();

          let { appointments } = model.getData();

          model.setProperty("/dialogBusy", true);

          try {
            // Remove customer & project (= Navigation-Props) from the object, so the getters won't be overwritten
            const { customer, project, ...appointmentSync } =
              await this._submitEntry(appointment);

            appointments[appointmentSync.ID] = Object.assign(
              appointment,
              appointmentSync
            );

            appointments["NEW"] = {};

            model.setProperty("/appointments", appointments);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          model.setProperty("/dialogBusy", false);
          this._closeDialog("createItemDialog");
        },

        // Weil das Feld 'customer' im FE zur Feldvalidierung manipuliert wurde, wird er nicht weggespeichert und per Object-Destructuring entfernt
        // eslint-disable-next-line no-unused-vars
        _submitEntry({ customer, __metadata, ...appointment }) {
          const { ID } = appointment;

          // Update
          if (ID) {
            const path = `/MyWorkItems('${encodeURIComponent(ID)}')`;

            return this.update({
              path,
              data: appointment,
            });
          }

          // Create
          else {
            return this.create({ path: "/MyWorkItems", data: appointment });
          }
        },

        onAfterCloseDialog() {
          const appointment = this.byId("createItemDialog")
            .getBindingContext()
            .getObject();

          if (!appointment || !appointment.ID)
            this.getModel().setProperty("/appointments/NEW", {});
        },

        onCloseDialog(event) {
          event.getSource().getParent().close();
        },

        _closeDialog(dialogName) {
          this.byId(dialogName).close();
        },

        onChangeView: function () {
          this._loadAppointments();
        },

        onStartDateChange: function () {
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

          const startDate = calendar.getStartDate();
          const endDate = this._getCalendarEndDate();

          const { results: appointments } = await this.read({
            path: "/MyWorkItems",
            urlParameters: { $top: 100 },
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
            map[appointment.ID] = appointment;

            Object.defineProperty(appointment, "customer", {
              get: () =>
                model
                  .getProperty("/customers")
                  .find(
                    ({ friendlyID }) =>
                      friendlyID === appointment.customer_friendlyID
                  ),
            });
            return map;
          }, {});

          model.setProperty("/appointments", appointmentsMap);
        },

        async _loadCustomersAndProjects() {
          const model = this.getModel();
          const user = await this._getUserInfoService();
          // TODO: Mailadresse entfernen
          const email = user
            ? user.getEmail()
            : "benedikt.hoelker@iot-online.de";

          const { results: allProjects } = await this.read({
            path: "/Users2Projects",
            filters: [
              new Filter({
                path: "user_userPrincipalName",
                operator: "EQ",
                value1: email,
              }),
            ],
            urlParameters: { $expand: "project/customer" },
          });

          // Aus der Gesamtheit der Projekte werden die Kunden vereinzelt und Referenzen zu den jeweils zugeordneten Projekten abgegriffen => Ziel: dynamische Auswahl des Projekts abhängig vom gewählten Kunden
          const customers = Object.values(
            allProjects.reduce((map, { project: { customer, ...project } }) => {
              const mergeCustomer = map[customer.ID] || customer;

              if (Array.isArray(mergeCustomer.projects))
                mergeCustomer.projects.push(project);
              else mergeCustomer.projects = [project];

              map[customer.ID] = mergeCustomer;

              return map;
            }, {})
          );

          model.setProperty("/customers", customers);
        },

        _getUserInfoService: function () {
          return new Promise((resolve) =>
            sap.ui.require(["sap/ushell/library"], (ushellLib) => {
              const container = ushellLib.Container;
              if (!container) return resolve();

              const service = container.getServiceAsync("UserInfo"); // .getService is deprecated!
              return resolve(service);
            })
          );
        },
      }
    );
  }
);
