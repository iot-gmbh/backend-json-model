sap.ui.define(
  [
    "sap/ui/unified/CalendarAppointment",
    "./BaseController",
    "sap/ui/model/Filter",
    "../model/formatter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (CalendarAppointment, BaseController, Filter, formatter) {
    "use strict";
    formatter;

    function getMonday(d) {
      d = new Date(d);
      var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
      return new Date(d.setDate(diff));
    }

    return BaseController.extend(
      "iot.singleplanningcalendar.controller.SinglePlanningCalendar",
      {
        onInit: function () {
          const calendar = this.byId("SPCalendar");
          // const monthView = calendar.getViews()[3];
          // const today = new Date();
          // const firstDayOfMonth = new Date(
          //   today.getFullYear(),
          //   today.getMonth(),
          //   1
          // );

          const workWeekView = calendar.getViews()[1];
          calendar.setSelectedView(workWeekView);
          calendar.setStartDate(getMonday(new Date()));

          this._bindAppointments();
        },

        onCreateAppointment() {
          const context = this._createAppointment();
          this._bindAndOpenDialog(context);
        },

        onChangeSelectedProject(event) {
          const dialog = this.byId("createItemDialog");
          const selectCtrl = event.getSource();
          const projectName = selectCtrl.getSelectedItem().getText();
          const path = dialog.getBindingContext().getPath();
          this.getModel().setProperty(`${path}/projectName`, projectName);
        },

        onSubmitEntry(event) {
          this.getModel().submitChanges();
          event.getSource().getParent().close();
        },

        onCloseDialog(event) {
          this.getModel().resetChanges();
          event.getSource().getParent().close();
        },

        _createAppointment(properties) {
          return this.getModel().createEntry("/MyWork", {
            properties,
          });
        },

        _bindAndOpenDialog(context) {
          const dialog = this.byId("createItemDialog");

          dialog.setBindingContext(context);
          dialog.open();
        },

        onChangeView: function () {
          this._bindAppointments();
        },

        onStartDateChange: function () {
          this._bindAppointments();
        },

        onPressAppointment(event) {
          const { appointment } = event.getParameters();
          if (!appointment) return;
          this._bindAndOpenDialog(appointment.getBindingContext());
        },

        onCellPress(event) {
          const { startDate, endDate } = event.getParameters();
          const context = this._createAppointment({
            activatedDate: startDate,
            completedDate: endDate,
          });
          this._bindAndOpenDialog(context);
        },

        _toISOString(date) {
          return date.toISOString().substring(0, 19) + "Z";
        },

        _bindAppointments() {
          const calendar = this.getView().byId("SPCalendar");
          const startDate = calendar.getStartDate();
          const oneMonthLater = this._getDateOneMonthLater(startDate);

          const template = new CalendarAppointment({
            startDate: "{activatedDate}",
            endDate: "{completedDate}",
            title: "{title}",
            text: "{projectName}",
            type: { path: "type", formatter: formatter.getDisplayType },
          });

          // Bind the Aggregation
          calendar.bindAggregation("appointments", {
            path: "/MyWork",
            sorter: null,
            template,
            templateShareable: true,
            filters: [
              new Filter({
                path: "completedDate",
                operator: "GT",
                value1: startDate.toISOString(),
              }),
              new Filter({
                path: "activatedDate",
                operator: "LE",
                value1: oneMonthLater.toISOString(),
              }),
            ],
          });
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
