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
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    ErrorParser,
    Filter,
    formatter,
    JSONModel,
    legendItems,
    MessageBox,
    MessageToast
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
          const dialog = this.byId("createItemDialog");

          const model = new JSONModel({
            appointments: { NEW: {} },
            busy: false,
            customers: [],
            projects: [],
            get projectsFiltered() {
              const bc = dialog.getBindingContext();
              if (!bc) return [];
              const selected = bc.getProperty("customer_ID");

              return this.projects.filter(
                ({ customer_ID }) => customer_ID === selected
              );
            },
            workPackages: [],
            get workPackagesFiltered() {
              const bc = dialog.getBindingContext();
              if (!bc) return [];
              const selected = bc.getProperty("project_ID");

              return this.workPackages.filter(
                ({ project_ID }) => project_ID === selected
              );
            },
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

                const appointment = this.byId("createItemDialog")
                  .getBindingContext()
                  .getObject();

                this._deleteAppointment(appointment);
              }
            }
          });
        },

        onSelectCustomer(event) {
          const selectedItem = event.getParameter("selectedItem");
          if (!selectedItem) return;

          const selectedCustomerFriendly = selectedItem
            .getBindingContext()
            .getProperty("friendlyID");

          const path = event.getSource().getBindingContext().getPath();

          this.getModel().setProperty(
            path + "/customer_friendlyID",
            selectedCustomerFriendly
          );
        },

        onProjectChange: function () {
          // Reset if the project has no packages
          const model = this.getModel();
          const workPackagesFiltered = model.getProperty(
            "/workPackagesFiltered"
          );

          if (workPackagesFiltered.length === 0) {
            const path = this.byId("createItemDialog")
              .getBindingContext()
              .getPath();
            model.setProperty(path + "/workPackage_ID", undefined);
          }
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

          if (!data.customer_ID || !data.project_ID) {
            this._bindAndOpenDialog(path);
            return;
          }

          try {
            // Remove customer & project (= Navigation-Props) from the object, so the getters won't be overwritten
            const appointmentSync = await this._submitEntry({
              ...data,
              activatedDate: startDate,
              completedDate: endDate,
            });

            appointments[appointmentSync.ID] = appointmentSync;

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
            const appointmentSync = await this.reset({
              path: `/MyWorkItems('${encodeURIComponent(appointment.ID)}')`,
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
          const model = this.getModel();
          const { startDate, endDate } = event.getParameters();
          const appointment = {
            activatedDate: startDate,
            completedDate: endDate,
          };

          model.setProperty("/appointments/NEW", appointment);

          this._bindAndOpenDialog("/appointments/NEW");
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

          dialog.bindElement(path);

          this._refreshSelectControls();
          dialog.open();
        },

        onAfterOpenDialog() {
          // Update all bindings (otherwisy there is outdated data in the dependent Select-controls)
          this._refreshSelectControls();
        },

        _refreshSelectControls() {
          [
            this.byId("customerSelect"),
            this.byId("projectSelect"),
            this.byId("packageSelect"),
          ].forEach((select) => select.getBinding("items").refresh());
        },

        async onSubmitEntry() {
          const model = this.getModel();
          const appointment = this.byId("createItemDialog")
            .getBindingContext()
            .getObject();

          let { appointments } = model.getData();

          model.setProperty("/dialogBusy", true);

          try {
            const appointmentSync = await this._submitEntry(appointment);

            appointments[appointmentSync.ID] = appointmentSync;
            appointments["NEW"] = {};

            model.setProperty("/appointments", appointments);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

          model.setProperty("/dialogBusy", false);
          this._closeDialog("createItemDialog");
        },

        _submitEntry(appointment) {
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
            urlParameters: { $expand: "project/customer,project/workPackages" },
          });

          let customers = [];
          let projects = [];
          let workPackages = [];

          allProjects.forEach(({ project }) => {
            projects.push(project);
            customers.push(project.customer);
            workPackages.push(...project.workPackages.results);
          });

          model.setProperty("/customers", [
            ...new Map(customers.map((cstmer) => [cstmer.ID, cstmer])).values(),
          ]);
          model.setProperty("/projects", projects);
          model.setProperty("/workPackages", workPackages);
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
