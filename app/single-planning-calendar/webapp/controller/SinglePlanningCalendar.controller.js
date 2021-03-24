sap.ui.define(
  [
    "sap/ui/unified/CalendarAppointment",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "../model/formatter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (CalendarAppointment, Controller, Filter, formatter) {
    "use strict";
    formatter;

    return Controller.extend(
      "iot.singleplanningcalendar.controller.SinglePlanningCalendar",
      {
        onInit: function () {
          const calendar = this.byId("SPCalendar");
          const monthView = calendar.getViews()[3];
          const today = new Date();
          const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );

          calendar.setSelectedView(monthView);
          calendar.setStartDate(firstDayOfMonth);

          this._bindAppointments();
        },

        closeDialog(event) {
          event.getSource().getParent().close();
        },

        onCreateAppointment() {
          const context = this.getView().getModel().createEntry("/MyWork");
          this._bindAndOpenDialog(context);
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
          this._bindAndOpenDialog(appointment.getBindingContext());
        },

        _bindAppointments() {
          const calendar = this.getView().byId("SPCalendar");
          const startDate = calendar.getStartDate();
          const oneMonthLater = this._getDateOneMonthLater(startDate);

          const template = new CalendarAppointment({
            startDate: "{activatedDate}",
            endDate: "{completedDate}",
            title: "{title}",
            text: "{customer}",
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
