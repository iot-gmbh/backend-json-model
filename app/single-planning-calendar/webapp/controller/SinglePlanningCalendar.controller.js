sap.ui.define(
  [
    "sap/ui/unified/CalendarAppointment",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (CalendarAppointment, Controller, Filter) {
    "use strict";

    return Controller.extend(
      "iot.singleplanningcalendar.controller.SinglePlanningCalendar",
      {
        onInit: function () {
          const calendar = this.getView().byId("SPCalendar");
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

        onChangeView: function () {
          this._bindAppointments();
        },

        onStartDateChange: function () {
          this._bindAppointments();
        },

        getDateOneMonthLater(date) {
          const dateCompare = new Date(date);
          const newDate = new Date(
            dateCompare.setMonth(dateCompare.getMonth() + 1)
          );
          return newDate;
        },

        _bindAppointments() {
          const calendar = this.getView().byId("SPCalendar");
          const startDate = calendar.getStartDate();
          const oneMonthLater = this.getDateOneMonthLater(startDate);

          const template = new CalendarAppointment({
            startDate: "{activatedDate}",
            endDate: "{completedDate}",
            title: "{title}",
            type: "{= ${type} === 'Event' ? 'Type01' : 'Type06'}",
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
      }
    );
  }
);
