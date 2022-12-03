/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "../model/formatter",
    "../model/legendItems",
    "sap/base/Log",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
  ],
  (
    BaseController,
    Filter,
    formatter,
    legendItems,
    Log,
    MessageBox,
    MessageToast,
    Sorter
  ) => {
    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    function getMondayMorning() {
      const date = new Date(new Date().setHours(0, 0, 0, 1));
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(date.setDate(diff));
    }

    return BaseController.extend(
      "iot.planner.components.singleplanningcalendar.controller.SingleEntry",
      {
        formatter,

        async onInit() {
          const bundle = this.getResourceBundle();
          const router = this.getRouter();

          this.byId("detailPage").bindElement("/MyWorkItemDrafts/0");

          [
            router.getRoute("singleEntry"),
            router.getRoute("masterDetail"),
          ].forEach((route) => {
            route.attachPatternMatched(
              () =>
                Promise.all([this._loadAppointments(), this._loadHierarchy()]),
              this
            );
          });

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

        onBeforeRendering() {
          const bundle = this.getResourceBundle();
          const model = this.getModel();
          const now = new Date();
          const dateFilter = {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          };

          model.setData({
            MyWorkItems: { NEW: {} },
            busy: true,
            dateFilter,
            categories: {},
            hierarchySuggestion: "",
            legendItems: Object.entries(legendItems.getItems()).map(
              ([key, { type }]) => ({
                text: bundle.getText(`legendItems.${key}`),
                type,
              })
            ),
          });

          this._bindMasterList();

          // Otherwise new entries won't be displayed in the calendar
          model.setSizeLimit(300);
        },

        refreshMasterList() {
          this._bindMasterList();
        },

        _bindMasterList() {
          const model = this.getModel();
          const dateFilter = model.getProperty("/dateFilter");

          this.byId("workItemsList").bindItems({
            path: "/MyWorkItemDrafts",
            sorter: [
              new Sorter("date", null, (context) => {
                const workItems = model.getProperty("/MyWorkItemDrafts") || [];
                const myDate = context.getProperty("date");
                const totalDuration = workItems
                  .filter(({ date }) => date === myDate)
                  .reduce((sum, { duration }) => sum + +duration, 0)
                  .toFixed(2);
                return {
                  key: myDate,
                  title: `${myDate} ${totalDuration}`,
                  number: totalDuration,
                };
              }),
              new Sorter("activatedDate"),
            ],
            groupHeaderFactory({ key, number, title }) {
              const item = new sap.m.StandardListItem({
                title: key,
                info: `${number} h`,
              });
              const styleClasses = [
                "sapMLIB sapMLIB-CTX sapMLIBShowSeparator sapMLIBTypeInactive sapMGHLI",
              ].forEach((styleClass) => item.addStyleClass(styleClass));
              return item;
            },
            template: this.byId("workItemsListItem"),
            filters: [
              new Filter("activatedDate", "GE", dateFilter.start),
              new Filter("completedDate", "LE", dateFilter.end),
            ],
          });
        },

        onSelectionChange(event) {
          const { listItem } = event.getParameters();
          const selectedID = listItem.getBindingContext().getProperty("ID");
          const index = this.getModel()
            .getProperty("/MyWorkItemDrafts")
            .findIndex(({ ID }) => ID === selectedID);

          this.byId("detailPage").bindElement(`/MyWorkItemDrafts/${index}`);
        },

        onSelectHierarchy(event) {
          const { rowContext } = event.getParameters();

          if (!rowContext) return;

          const hierarchyPath = rowContext.getProperty("path");
          const path = event.getSource().getBindingContext().getPath();

          this.getModel().setProperty(`${path}/parentPath`, hierarchyPath);
        },

        onChangeHierarchy(event) {
          const { newValue } = event.getParameters();
          this._filterHierarchyByPath(newValue);
        },

        filterTree(array, texts) {
          // See: https://stackoverflow.com/questions/45289854/how-to-effectively-filter-tree-view-retaining-its-existing-structure
          const getChildren = (result, object) => {
            if (
              object.path &&
              texts.every((text) => object.path.includes(text))
              //   ||
              // (object.absoluteReference &&
              //   texts.every((text) =>
              //     object.absoluteReference.toUpperCase().includes(text)
              //   )) ||
              // (object.deepReference &&
              //   texts.every((text) =>
              //     object.deepReference.toUpperCase().includes(text)
              //   ))
            ) {
              result.push(object);
              return result;
            }

            if (Array.isArray(object.children)) {
              const children = object.children.reduce(getChildren, []);
              if (children.length) result.push({ ...object, children });
            }
            return result;
          };

          return array.reduce(getChildren, []);
        },

        _filterHierarchyByPath(query) {
          const filters = [];
          const model = this.getModel();
          const { MyCategoriesNested } = model.getData();

          if (!query) {
            model.setProperty("/MyCategoriesNestedAndFiltered", []);
            return;
          }

          const categoriesFiltered = this.filterTree(
            MyCategoriesNested,
            query.split(" ").filter(Boolean)
          );

          model.setProperty(
            "/MyCategoriesNestedAndFiltered",
            categoriesFiltered
          );
        },

        async onSubmitEntry() {
          const model = this.getModel();
          const appointment = this.getView().getBindingContext().getObject();
          const path = this.getView().getBindingContext().getPath();

          if (appointment.isAllDay) {
            MessageToast.show(
              this.getResourceBundle().getText(
                "message.allDayEventsAreNotEditable"
              )
            );
            return;
          }

          model.setProperty("/dialogBusy", true);

          appointment.localPath = path;

          model.setProperty("/dialogBusy", false);

          try {
            await this._submitEntry(appointment);
          } catch (error) {
            Log.error(error);
          }
        },

        async _submitEntry(appointment) {
          const data = appointment;
          const model = this.getModel();
          const { MyCategories } = model.getData();
          const parent = MyCategories.find(
            (cat) => cat.path === appointment.parentPath
          );

          data.parentPath = parent.path;
          data.parent_ID = parent.ID;
          data.confirmed = true;

          // Update
          if (data.ID) {
            await model.update(data);

            const appointments = model.getProperty("/MyWorkItemDrafts");
            model.setProperty(
              "/MyWorkItemDrafts",
              appointments.filter(({ confirmed }) => !confirmed)
            );

            this.byId("hierarchySearch").focus();
            model.setProperty("/MyCategoriesNestedAndFiltered", []);
          } else {
            await model.create("/MyWorkItems", data);

            model.setProperty("/MyWorkItems/NEW", {});
          }
        },

        onChangeView() {
          this._loadAppointments();
        },

        onStartDateChange() {
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
          const startDate = addDays(Date.now(), -31);
          const endDate = Date.now();

          model.setProperty("/busy", true);

          const { results: workItems } = await model.callFunction(
            "/getCalendarView",
            {
              urlParameters: {
                startDateTime: startDate,
                endDateTime: endDate,
              },
            }
          );

          const appointments = workItems.map(
            ({ completedDate, activatedDate, isAllDay, ...appointment }) => ({
              ...appointment,
              tags: appointment.tags.results,
              // completedDate,
              // activatedDate,
              activatedDate: isAllDay
                ? new Date(activatedDate.setHours(0))
                : activatedDate,
              completedDate: isAllDay
                ? addDays(completedDate.setHours(0), -1)
                : completedDate,
            })
          );

          model.setProperty("/MyWorkItems", appointments);
          model.setProperty(
            "/MyWorkItemDrafts",
            appointments.filter(({ confirmed }) => !confirmed)
          );

          model.setProperty("/busy", false);
        },

        async _loadHierarchy() {
          const model = this.getModel();

          model.setProperty("/busy", true);

          try {
            const { results } = await model.callFunction("/getMyCategoryTree");
            const categoriesNested = model.nest({ items: results });

            model.setProperty("/MyCategories", results);
            model.setProperty("/MyCategoriesNested", categoriesNested);
            model.setProperty("/MyCategoriesNestedAndFiltered", []);
          } catch (error) {
            Log.error(error);
          }

          model.setProperty("/busy", false);
        },

        _getUser() {
          return new Promise((resolve, reject) => {
            this.getModel().read("/MyUser", {
              success: (response) => {
                const myUser = response.results[0];
                if (!myUser)
                  reject(
                    new Error("User does not exist in DB. Please create it.")
                  );
                return resolve(myUser);
              },
            });
          });
        },
      }
    );
  }
);
