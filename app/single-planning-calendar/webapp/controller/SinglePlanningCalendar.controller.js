sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController, Filter, formatter, JSONModel, MessageBox) {
    "use strict";

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

        onInit: function () {
          const calendar = this.byId("SPCalendar");
          const workWeekView = calendar.getViews()[1];

          calendar.setSelectedView(workWeekView);
          calendar.setStartDate(getMonday(new Date()));

          const model = new JSONModel({
            appointments: [],
            appointment: {
              title: "",
              completedDate: new Date(),
              activatedDate: new Date(),
              // eslint-disable-next-line camelcase
              project_ID: "",
            },
          });

          // Otherwise new entries won't be displayed in the calendar
          model.setSizeLimit(300);

          this.setModel(model);

          this._loadData();
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
            MessageBox.error(error.message);
          }

          this.byId("createItemDialog").close();
        },

        _submitEntry(appointment) {
          // Update
          if (appointment.ID) {
            const path = this.getModel("OData").createKey(
              "/MyWork",
              appointment
            );
            return this.update({ path, data: appointment });
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
          this.getModel().setProperty("/appointment", appointment);
          this.byId("createItemDialog").open();
        },

        onChangeView: function () {
          this._loadData();
        },

        onStartDateChange: function () {
          this._loadData();
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

        _toISOString(date) {
          return date.toISOString().substring(0, 19) + "Z";
        },

        async _loadData() {
          const calendar = this.getView().byId("SPCalendar");
          const startDate = calendar.getStartDate();
          const oneWeekLater = this._addDays(startDate, 7);
          const { results: appointments } = await this.read({
            path: "/MyWork",
            urlParameters: { $top: 60 },
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

        _addDays(date, days) {
          const result = new Date(date);
          result.setDate(result.getDate() + days);
          return result;
        },

        _getDateOneMonthLater(date) {
          const dateCompare = new Date(date);
          const newDate = new Date(
            dateCompare.setMonth(dateCompare.getMonth() + 1)
          );
          return newDate;
        },
      }
    );
  }
);
