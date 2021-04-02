/* eslint-disable camelcase */
sap.ui.define(
  [
    "./BaseController",
    "./ErrorParser",
    "sap/ui/model/Filter",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    ErrorParser,
    Filter,
    formatter,
    JSONModel,
    MessageBox
  ) {
    "use strict";

    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    function getMonday(d) {
      d = new Date(d);
      var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
      return new Date(d.setDate(diff));
    }

    return BaseController.extend(
      "iot.singleplanningcalendar.controller.SinglePlanningCalendar",
      {
        formatter,

        onInit: async function () {
          const calendar = this.byId("SPCalendar");
          const workWeekView = calendar.getViews()[1];

          const model = new JSONModel({
            appointments: [],
            appointment: {},
            busy: false,
            customers: [],
          });

          calendar.setSelectedView(workWeekView);
          calendar.setStartDate(getMonday(new Date()));

          // Otherwise new entries won't be displayed in the calendar
          model.setSizeLimit(300);

          this.setModel(model);

          model.setProperty("/busy", true);

          try {
            await Promise.all([
              this._loadAppointments(),
              this._loadCustomersAndProjects(),
            ]);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          model.setProperty("/busy", false);
        },

        onCreateAppointment() {
          this._bindAndOpenDialog();
        },

        onChangeSelectedProject(event) {
          const selectCtrl = event.getSource();
          const projectName = selectCtrl.getSelectedItem().getText();

          this.getModel().setProperty("/appointment/projectName", projectName);
        },

        async onSubmitEntry() {
          const model = this.getModel();
          let { appointment, appointments } = model.getData();

          try {
            const appointmentSync = await this._submitEntry(appointment);

            model.setProperty(
              "/appointments",
              appointments.concat(appointmentSync)
            );
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          this.byId("createItemDialog").close();
        },

        // Weil das Feld 'customer' im FE zur Feldvalidierung manipuliert wurde, wird er nicht weggespeichert
        // eslint-disable-next-line no-unused-vars
        _submitEntry({ customer, ...appointment }) {
          const { ID } = appointment;

          // Update
          if (ID) {
            const path = `/MyWork('${encodeURIComponent(ID)}')`;

            return this.update({
              path,
              data: appointment,
            });
          }

          // Create
          else {
            return this.create({ path: "/MyWork", data: appointment });
          }
        },

        onCloseDialog(event) {
          event.getSource().getParent().close();
        },

        _bindAndOpenDialog(appointment = {}) {
          const model = this.getModel();
          const { customers } = model.getData();
          const bundle = this.getResourceBundle();

          Object.defineProperty(appointment, "customer", {
            get: () =>
              customers.find(
                ({ ID }) => ID === appointment.customer_friendlyID
              ),
          });

          model.setProperty("/appointment", appointment);
          model.setProperty(
            "/createItemDialogTitle",
            appointment.ID
              ? bundle.getText("editAppointment")
              : bundle.getText("createAppointment")
          );

          this.byId("createItemDialog").open();
        },

        onChangeView: function () {
          this._loadAppointments();
        },

        onStartDateChange: function () {
          this._loadAppointments();
        },

        onPressAppointment(event) {
          const { appointment } = event.getParameters();
          if (!appointment) return;

          this._bindAndOpenDialog(appointment.getBindingContext().getObject());
        },

        onCellPress(event) {
          const { startDate, endDate } = event.getParameters();

          this._bindAndOpenDialog({
            activatedDate: startDate,
            completedDate: endDate,
          });
        },

        async _loadAppointments() {
          const calendar = this.getView().byId("SPCalendar");
          const startDate = calendar.getStartDate();
          const oneWeekLater = addDays(startDate, 7);
          const { results: appointments } = await this.read({
            path: "/MyWork",
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
                    value1: oneWeekLater,
                  }),
                ],
                and: false,
              }),
            ],
          });

          this.getModel().setProperty("/appointments", appointments);
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

              if (typeof mergeCustomer.projects === Array)
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
