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
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    ErrorParser,
    Filter,
    formatter,
    JSONModel,
    MessageBox,
    MessageToast
  ) {
    "use strict";

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
          const calendar = this.byId("SPCalendar");
          const workWeekView = calendar.getViews()[1];

          const model = new JSONModel({
            appointments: { NEW: {} },
            busy: false,
            customers: [],
            legendItems: [
              {
                key: "Manual_Allocated_Billed",
                text: "Manual, Allocated, Billed",
                type: "Type01",
              },
              {
                key: "Manual_Allocated_NotBilled",
                text: "Manual, Allocated, Not Billed",
                type: "Type02",
              },
              {
                key: "Manual_NotAllocated_Billed",
                text: "Manual, Not Allocated, Billed",
                type: "Type03",
              },
              {
                key: "Manual_NotAllocated_NotBilled",
                text: "Manual, Not Allocated, Not Billed",
                type: "Type04",
              },
              {
                key: "WorkItem_Allocated_Billed",
                text: "WorkItem, Allocated, Billed",
                type: "Type05",
              },
              {
                key: "WorkItem_Allocated_NotBilled",
                text: "WorkItem, Allocated, Not Billed",
                type: "Type06",
              },
              {
                key: "WorkItem_NotAllocated_Billed",
                text: "WorkItem, Not Allocated, Billed",
                type: "Type07",
              },
              {
                key: "WorkItem_NotAllocated_NotBilled",
                text: "WorkItem, Not Allocated, Not Billed",
                type: "Type08",
              },
              {
                key: "Event_Allocated_Billed",
                text: "Event, Allocated, Billed",
                type: "Type09",
              },
              {
                key: "Event_Allocated_NotBilled",
                text: "Event, Allocated, Not Billed",
                type: "Type10",
              },
              {
                key: "Event_NotAllocated_Billed",
                text: "Event, Not Allocated, Billed",
                type: "Type11",
              },
              {
                key: "Event_NotAllocated_NotBilled",
                text: "Event, Not Allocated, Not Billed",
                type: "Type12",
              },
            ],
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

            if (
              evt.ctrlKey &&
              evt.keyCode == 13 &&
              !activeElementID.includes("submitButton")
            ) {
              evt.preventDefault();
              this.onSubmitEntry();
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
          const { assignedTo, customer, project, __metadata, ...data } =
            bindingContext.getObject();
          const path = bindingContext.getPath();

          model.setProperty(path + "/activatedDate", startDate);
          model.setProperty(path + "/completedDate", endDate);

          if (!data.customer_friendlyID || !data.project_friendlyID) {
            this._bindAndOpenDialog(path);
            return;
          }

          try {
            const { ...appointmentSync } = await this._submitEntry({
              ...data,
              activatedDate: startDate,
              completedDate: endDate,
            });

            appointments[appointmentSync.ID] = {
              assignedTo,
              ...data,
              ...appointmentSync,
              customer,
              project,
            };

            model.setProperty("/appointments", appointments);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }
        },

        async onPressDeleteAppointment(event) {
          const model = this.getModel();
          const { appointments } = model.getData();
          const appointment = event.getSource().getBindingContext().getObject();

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

        async onPressResetAppointment(event) {
          const model = this.getModel();
          const { appointments } = model.getData();
          const appointment = event.getSource().getBindingContext().getObject();
          // Remove associations to prevent BE-errors
          // eslint-disable-next-line no-unused-vars
          const { customer, project, __metadata, ...data } = appointment;

          model.setProperty("/dialogBusy", true);

          try {
            const appointmentSync = await this.reset({
              path: `/MyWorkItems('${encodeURIComponent(appointment.ID)}')`,
              data,
            });

            appointments[appointmentSync.ID] = {
              ...data,
              ...appointmentSync,
              customer,
              project,
            };

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

        async onSubmitEntry() {
          const model = this.getModel();
          const { project, customer, ...appointment } = this.byId(
            "createItemDialog"
          )
            .getBindingContext()
            .getObject();

          let { appointments } = model.getData();

          model.setProperty("/dialogBusy", true);

          try {
            const appointmentSync = await this._submitEntry(appointment);

            appointments[appointmentSync.ID] = {
              ...appointment,
              ...appointmentSync,
              project,
              customer,
            };

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
          const { results: allProjects } = await this.read({
            path: "/Projects",
            urlParameters: { $expand: "customer" },
          });

          // Aus der Gesamtheit der Projekte werden die Kunden vereinzelt und Referenzen zu den jeweils zugeordneten Projekten abgegriffen => Ziel: dynamische Auswahl des Projekts abhängig vom gewählten Kunden
          const customers = Object.values(
            allProjects.reduce((map, { customer, ...project }) => {
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
      }
    );
  }
);
