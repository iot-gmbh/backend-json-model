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

    const selectControlIDs = [
      "customerSelect",
      "projectSelect",
      "packageSelect",
    ];

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
            projectsFiltered: [],
            workPackages: [],
            workPackagesFiltered: [],
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

          this.setModel(model);

          await this.getModel("OData").metadataLoaded();

          try {
            await Promise.all([
              this._loadAppointments(),
              this._loadCustomersAndProjects(),
            ]);
          } catch (error) {
            MessageBox.error(ErrorParser.parse(error));
          }

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

                const appointmentControl = sap.ui
                  .getCore()
                  .byId(activeElementID);
                const appointment = appointmentControl
                  .getBindingContext()
                  .getObject();

                this._deleteAppointment(appointment);
              }
            }
          });
        },

        onAfterOpenDialog() {
          // Update all bindings (otherwise there is outdated data in the dependent Select-controls)
          this._refreshSelectControls();
        },

        _getSelectControls() {
          return selectControlIDs.map((ID) => this.byId(ID));
        },

        _refreshSelectControls() {
          this._getSelectControls().forEach((select) =>
            select.getBinding("items").refresh()
          );
        },

        onSelectCustomer(event) {
          const model = this.getModel();
          const selectedItem = event.getParameter("selectedItem");

          if (!selectedItem) return;

          const selectedCustomer = selectedItem.getBindingContext().getObject();
          const { projects, workPackages } = model.getData();

          const projectsFiltered = projects.filter(
            ({ customer_ID }) => customer_ID === selectedCustomer.ID
          );

          const firstProject = projectsFiltered[0];

          let packagesFiltered = [];
          let firstProjectID = "";
          let firstPackageID = "";

          if (firstProject) {
            packagesFiltered = workPackages.filter(
              ({ project_ID }) => project_ID === firstProject.ID
            );

            firstProjectID = firstProject.ID;
            firstPackageID = packagesFiltered[0] ? packagesFiltered[0].ID : "";

            this.byId("projectSelect").setSelectedKey(firstProjectID);
            this.byId("packageSelect").setSelectedKey(firstPackageID);
          }

          model.setProperty("/projectsFiltered", projectsFiltered);
          model.setProperty("/workPackagesFiltered", packagesFiltered);
        },

        onSelectProject(event) {
          const model = this.getModel();
          const selectedItem = event.getParameter("selectedItem");

          if (!selectedItem) return;

          const selectedProject = selectedItem.getBindingContext().getObject();
          const { workPackages } = model.getData();

          const packagesFiltered = workPackages.filter(
            ({ project_ID }) => project_ID === selectedProject.ID
          );

          const firstPackageKey = packagesFiltered[0]
            ? packagesFiltered[0].ID
            : "";

          model.setProperty("/workPackagesFiltered", packagesFiltered);
          this.byId("packageSelect").setSelectedKey(firstPackageKey);
        },

        onDisplayLegend() {
          this.byId("legendDialog").open();
        },

        onPressAppointment(event) {
          const { appointment } = event.getParameters();

          if (appointment) {
            this._bindAndOpenDialog(appointment.getBindingContext().getPath());
          }
        },

        async onEditAppointment(event) {
          const model = this.getModel();
          const { appointments } = model.getData();
          const { startDate, endDate, appointment, copy } =
            event.getParameters();
          const bindingContext = appointment.getBindingContext();
          const data = bindingContext.getObject();

          let path = bindingContext.getPath();

          if (copy) {
            path = "/appointments/NEW";
            model.setProperty("/appointments/NEW", appointment);
          }

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
              path: `/MyWorkItems(ID='${encodeURIComponent(appointment.ID)}')`,
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
              path: `/MyWorkItems(ID='${encodeURIComponent(appointment.ID)}')`,
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
          this._createAppointment(event);
          this._bindAndOpenDialog("/appointments/NEW");
        },

        _createAppointment(event) {
          const model = this.getModel();
          const { startDate, endDate } = event.getParameters();
          const appointment = {
            activatedDate: startDate,
            completedDate: endDate,
          };

          model.setProperty("/appointments/NEW", appointment);
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

          this.byId("packageSelect").setSelectedKey(undefined);
          this.byId("projectSelect").setSelectedKey(undefined);
          this.byId("customerSelect").setSelectedKey(undefined);
          dialog.bindElement(path);
          dialog.open();
        },

        async onSubmitEntry() {
          const model = this.getModel();
          const appointment = this.byId("createItemDialog")
            .getBindingContext()
            .getObject();

          let { appointments } = model.getData();

          model.setProperty("/dialogBusy", true);

          const projectSelect = this.byId("projectSelect");
          const packageSelect = this.byId("packageSelect");

          appointment.project_ID =
            projectSelect.getItems().length > 0
              ? projectSelect.getSelectedKey()
              : null;

          appointment.workPackage_ID =
            packageSelect.getItems().length > 0
              ? packageSelect.getSelectedKey()
              : null;

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
            const path = `/MyWorkItems(ID='${encodeURIComponent(
              appointment.ID
            )}')`;
            // const path = this.getModel("OData").createKey(
            //   "/MyWorkItems",
            //   appointment
            // );

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

          this.byId("createItemDialog").unbindElement();
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
          const appointmentsOld = model.getProperty("/appointments");
          const startDate = calendar.getStartDate();
          const endDate = this._getCalendarEndDate();

          model.setProperty("/busy", true);

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
            map[appointment.ID] = {
              /* Trick, to get the dates right: Somehow all-day events start and end at 02:00 instead of 00:00.
                This leads to problems with UI5, because the events are repeated each day which is ugly
                TODO: Find a better solution. Maybe this thread can help: https://answers.sap.com/questions/13324088/why-cap-shows-datetime-field-different-in-fiori-db.html
              */
              completedDate: appointment.isAllDay
                ? appointment.completedDate.setHours(0)
                : appointment.completedDate,
              activatedDate: appointment.isAllDay
                ? appointment.activatedDate.setHours(0)
                : appointment.activatedDate,
              ...appointment,
            };

            return map;
          }, {});

          model.setProperty("/appointments", {
            ...appointmentsOld,
            ...appointmentsMap,
          });

          model.setProperty("/busy", false);
        },

        async _loadCustomersAndProjects() {
          const model = this.getModel();
          const user = await this._getUser();

          model.setProperty("/busy", true);

          const { results: allProjects } = await this.read({
            path: "/Users2Projects",
            filters: [
              new Filter({
                path: "user_userPrincipalName",
                operator: "EQ",
                value1: user.userPrincipalName,
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
          model.setProperty("/busy", false);
        },

        _getUser: function () {
          return new Promise((resolve, reject) => {
            this.getModel("OData").read("/MyUser", {
              success: (response) => {
                const myUser = response.results[0];
                if (!myUser)
                  reject("User does not exist in DB. Please create it.");
                return resolve(myUser);
              },
            });
          });
        },
      }
    );
  }
);
