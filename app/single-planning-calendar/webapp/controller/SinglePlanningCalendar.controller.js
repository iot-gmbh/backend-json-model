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
          this._bindAppointments();
        },

        onChangeView: function () {
          this._bindAppointments();
        },

        onStartDateChange: function () {
          this._bindAppointments();
        },

        _bindAppointments() {
          const calendar = this.getView().byId("SPCalendar");
          const startDate = calendar.getStartDate();

          const template = new CalendarAppointment({
            startDate: "{activatedDate}",
            endDate: "{completedDate}",
            title: "{title}",
            color: "{= ${type} === 'Event' ? 'blue' : 'green'}",
          });

          // Bind the Aggregation
          calendar.bindAggregation("appointments", {
            path: "/MyWorkItems",
            sorter: null,
            template,
            templateShareable: true,
            filters: [
              new Filter({
                path: "activatedDate",
                operator: "GE",
                value1: startDate.toISOString(),
              }),
            ],
          });
        },
      }
    );
  }
);
