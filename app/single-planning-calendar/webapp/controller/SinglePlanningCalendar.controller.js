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

    function getMondayMorning(d) {
      d = new Date(d.setHours(0, 0, 0, 1));
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
            appointments: { NEW: {} },
            busy: false,
            customers: [],
          });

          calendar.setSelectedView(workWeekView);
          calendar.setStartDate(getMondayMorning(new Date()));

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
        },

        onPressAppointment(event) {
          const { appointment } = event.getParameters();
          const path = appointment
            ? appointment.getBindingContext().getPath()
            : "/appointments/NEW";

          this._bindAndOpenDialog(path);
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

          // model.setProperty(path, appointment);
          model.setProperty(
            "/createItemDialogTitle",
            appointment.ID
              ? bundle.getText("editAppointment")
              : bundle.getText("createAppointment")
          );

          // eslint-disable-next-line no-undef
          $(document).keydown((evt) => this._registerCtrlEnterPress(evt));

          dialog.bindElement(path);
          dialog.open();
        },

        onChangeSelectedProject(event) {
          const selectCtrl = event.getSource();
          const projectName = selectCtrl.getSelectedItem().getText();

          this.getModel().setProperty("/appointment/projectName", projectName);
        },

        async onSubmitEntry() {
          const appointment = this.byId("createItemDialog")
            .getBindingContext()
            .getObject();
          const model = this.getModel();
          let { appointments } = model.getData();

          try {
            if (!appointment.project)
              appointment.project_friendlyID =
                appointment.customer.projects[0].friendlyID;

            const appointmentSync = await this._submitEntry(appointment);

            appointments[appointmentSync.ID] = appointmentSync;
            appointments["NEW"] = {};

            model.setProperty("/appointments", appointments);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          this._closeDialog(this.byId("createItemDialog").close());
        },

        // Weil das Feld 'customer' im FE zur Feldvalidierung manipuliert wurde, wird er nicht weggespeichert und per Object-Destructuring entfernt
        // eslint-disable-next-line no-unused-vars
        _submitEntry({ customer, ...appointment }) {
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

        onCloseDialog(event) {
          const appointment = event.getSource().getBindingContext().getObject();

          if (!appointment.ID)
            this.getModel().setProperty("/appointments/NEW", {});

          this._closeDialog(event.getSource().getParent().close());
        },

        _closeDialog(dialog) {
          // eslint-disable-next-line no-undef
          $(document).off("keydown", (evt) =>
            this._registerCtrlEnterPress(evt)
          );

          dialog.close();
        },

        _registerCtrlEnterPress(evt) {
          if (evt.ctrlKey && evt.keyCode == 13) {
            evt.preventDefault();
            this.onSubmitEntry();
          }
        },

        onChangeView: function () {
          this._loadAppointments();
        },

        onStartDateChange: function () {
          this._loadAppointments();
        },

        async _loadAppointments() {
          const model = this.getModel();
          const calendar = this.getView().byId("SPCalendar");
          const startDate = calendar.getStartDate();
          const oneWeekLater = addDays(startDate, 7);
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
                    value1: oneWeekLater,
                  }),
                ],
                and: false,
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
