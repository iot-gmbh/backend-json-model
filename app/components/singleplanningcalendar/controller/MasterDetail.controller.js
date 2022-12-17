/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
sap.ui.define(
  [
    "../../../controller/BaseController",
    "sap/ui/model/Filter",
    "../model/formatter",
    "../model/legendItems",
    "sap/base/Log",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/StandardListItem",
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
    StandardListItem,
    Sorter
  ) => {
    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    function addMinutes(date, minutes) {
      return new Date(date.getTime() + minutes * 60000);
    }

    function getMondayMorning() {
      const date = new Date(new Date().setHours(0, 0, 0, 1));
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(date.setDate(diff));
    }

    function getFirstDayOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }

    function getLastDayOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    function msToHM(ms) {
      // https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript
      return new Date(parseInt(ms, 10)).toISOString().substring(11, 16);
    }

    function roundTimeToQuarterHour(time) {
      const timeToReturn = new Date(time);

      timeToReturn.setMilliseconds(
        Math.round(timeToReturn.getMilliseconds() / 1000) * 1000
      );
      timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
      timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
      return timeToReturn;
    }

    function combineDateAndTime(date, time) {
      const dateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
      );
      return dateTime;
    }

    return BaseController.extend(
      "iot.planner.components.singleplanningcalendar.controller.SingleEntry",
      {
        formatter,

        async onInit() {
          const bundle = this.getResourceBundle();

          this.byId("detailPage").bindElement("/MyWorkItems/0");

          const rootComponent = this.getRootComponent();
          const router = this.getRouter();

          rootComponent.attachEvent("login", () => {
            const hash = router.getHashChanger().getHash();
            const route = router.getRouteByHash(hash);
            if (
              [
                router.getRoute("singleEntry"),
                router.getRoute("masterDetail"),
              ].includes(route)
            ) {
              this.initModel();
            }
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
                const workItem = this.byId("detailPage")
                  .getBindingContext()
                  .getObject();

                this._deleteWorkItem(workItem);
              }
            }
          });
        },

        onBeforeRendering() {
          // use onBeforeRendering to make sure that this.getRootComponent().awaitLogin is defined (which gets defined in the parent App.controller)
          const router = this.getRouter();

          [
            router.getRoute("singleEntry"),
            router.getRoute("masterDetail"),
          ].forEach((route) => {
            route.attachPatternMatched(async () => {
              await this.getRootComponent().awaitLogin;

              await this.initModel();
            }, this);
          });
        },

        async initModel() {
          const bundle = this.getResourceBundle();
          const model = this.getModel();

          await this.getRootComponent().awaitLogin;
          await model.metadataLoaded();

          const filters = {
            showConfirmed: true,
            date: {
              start: getMondayMorning(),
              end: addDays(getMondayMorning(), 5),
            },
          };

          model.setData({
            MyWorkItems: { NEW: {} },
            busy: true,
            filters,
            categories: {},
            hierarchySuggestion: "",
            activities: [
              { title: "Durchführung" },
              { title: "Reise-/Fahrzeit" },
              { title: "Pendelfahrt Hotel/Einsatzort" },
            ],
            locations: [
              { title: "IOT" },
              { title: "Home-Office" },
              { title: "Rottendorf" },
            ],
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

          Promise.all([this._loadWorkItems(), this._loadHierarchy()]);
        },

        onPressDeleteWorkItem(event) {
          const workItem = event.getSource().getBindingContext().getObject();

          this._deleteWorkItem(workItem);
        },

        async _deleteWorkItem(workItem) {
          const model = this.getModel();

          model.setProperty("/busy", true);

          try {
            await model.remove(workItem);

            if (workItem.source !== "Manual") {
              await model.callFunction("/removeDraft", {
                method: "POST",
                urlParameters: {
                  ID: workItem.ID,
                  activatedDate: workItem.activatedDate,
                  completedDate: workItem.completedDate,
                },
              });
            }
          } catch (error) {
            Log.error(error);
          }

          model.setProperty("/busy", false);
        },

        async refreshMasterList() {
          await this._loadWorkItems();

          this._bindMasterList();
        },

        _bindMasterList() {
          const model = this.getModel();
          const { date: dateFilter, showConfirmed } =
            model.getProperty("/filters");

          const filters = [
            new Filter("activatedDate", "GE", dateFilter.start),
            new Filter("completedDate", "LE", dateFilter.end),
          ];

          if (showConfirmed === false) {
            filters.push(new Filter("confirmed", "EQ", false));
          }

          const template = this.byId("masterListItem");

          this.byId("masterList").bindItems({
            path: "/MyWorkItems",
            sorter: [
              new Sorter("dateString", null, (context) => {
                const workItems = model.getProperty("/MyWorkItems") || [];
                const {
                  dateString,
                  activatedDate: myActivatedDate,
                  completedDate: myCompletedDate,
                } = context.getObject();
                const totalDuration = workItems
                  .filter((item) => item.dateString === dateString)
                  .reduce(
                    (sum, { activatedDate, completedDate }) =>
                      sum + (completedDate - activatedDate),
                    0
                  )
                  .toFixed(2);

                return {
                  key: dateString,
                  title: `${dateString} ${totalDuration}`,
                  number: msToHM(totalDuration),
                };
              }),
              new Sorter("activatedDate"),
            ],
            groupHeaderFactory({ key, number, title }) {
              const item = new StandardListItem({
                title: key,
                info: `${number}`,
              });
              const styleClasses = [
                "sapMLIB sapMLIB-CTX sapMLIBShowSeparator sapMLIBTypeInactive sapMGHLI",
              ];

              styleClasses.forEach((styleClass) =>
                item.addStyleClass(styleClass)
              );

              return item;
            },
            factory: (controlID, context) => {
              const workItems = model.getProperty("/MyWorkItems") || [];
              const {
                ID: myID,
                activatedDate: myActivatedDate,
                completedDate: myCompletedDate,
              } = context.getObject();
              const overlap = workItems
                .filter(({ ID }) => !!ID && ID !== myID)
                .find(
                  ({ activatedDate, completedDate }) =>
                    (myActivatedDate < activatedDate &&
                      activatedDate < myCompletedDate) ||
                    (myActivatedDate < completedDate &&
                      completedDate < myCompletedDate) ||
                    (myActivatedDate.toString() === activatedDate.toString() &&
                      myCompletedDate.toString() === completedDate.toString())
                );

              template.setHighlight(overlap ? "Error" : "None");

              return template.clone(controlID);
            },
            // template,
            filters,
          });
        },

        _resetInitialWorkItem(startDate = roundTimeToQuarterHour(Date.now())) {
          const model = this.getModel();

          const workItem = {
            title: "",
            confirmed: true,
            date: startDate,
            // dateISOString: now,
            activatedDate: startDate,
            completedDate: addMinutes(startDate, 15),
          };

          model.setProperty("/MyWorkItems/NEW", workItem);
          model.setProperty("/MyCategoriesNestedAndFiltered", []);
        },

        onCreateWorkItem() {
          this._resetInitialWorkItem();
          this.byId("detailPage").bindElement("/MyWorkItems/NEW");
          this.byId("titleInput").focus();
        },

        onSelectionChange(event) {
          const { listItem } = event.getParameters();
          const selectedID = listItem.getBindingContext().getProperty("ID");
          const index = this.getModel()
            .getProperty("/MyWorkItems")
            .findIndex(({ ID }) => ID === selectedID);

          this.byId("detailPage").bindElement(`/MyWorkItems/${index}`);
          this.getModel().setProperty("/MyCategoriesNestedAndFiltered", []);
          // this.byId("hierarchySearch").focus();
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
          const bindingContext = this.byId("detailPage").getBindingContext();
          const workItem = bindingContext.getObject();
          const path = bindingContext.getPath();

          if (workItem.isAllDay) {
            MessageToast.show(
              this.getResourceBundle().getText(
                "message.allDayEventsAreNotEditable"
              )
            );
            return;
          }

          model.setProperty("/busy", true);

          workItem.localPath = path;

          try {
            const { ID } = await this._submitEntry(workItem);

            const masterList = this.byId("masterList");
            const selectedItem = masterList
              .getItems()
              .find(
                (item) =>
                  item.getBindingContext() &&
                  item.getBindingContext().getProperty("ID") === ID
              );

            this.byId("hierarchyTree").clearSelection(true);

            this._resetInitialWorkItem(workItem.completedDate);
            // First select new item
            masterList.setSelectedItem(selectedItem);
            // Focus it to scroll down
            selectedItem.focus();

            if (!workItem.ID) {
              // Focus the title input to seamlessly create a new item
              this.byId("titleInput").focus();
            }
          } catch (error) {
            Log.error(error);
          }

          model.setProperty("/busy", false);
        },

        async _submitEntry(workItem) {
          const data = workItem;
          const model = this.getModel();
          const { MyCategories } = model.getData();
          const parent = MyCategories.find(
            (cat) => cat.path === workItem.parentPath
          );

          data.parentPath = parent.path;
          data.parent_ID = parent.ID;
          data.confirmed = true;
          data.dateString = data.date.toLocaleDateString("en-CA");
          data.activatedDate = combineDateAndTime(
            data.date,
            data.activatedDate
          );
          data.completedDate = combineDateAndTime(
            data.date,
            data.completedDate
          );
          data.date = data.activatedDate;

          // Update
          if (data.ID) {
            const updatedItem = await model.update(data);

            this.byId("hierarchySearch").focus();
            model.setProperty("/MyCategoriesNestedAndFiltered", []);

            return updatedItem;
          }

          return model.create("/MyWorkItems", data);
        },

        async _loadWorkItems() {
          const model = this.getModel();
          const { start, end } = model.getProperty("/filters/date");

          model.setProperty("/busy", true);

          const { results: workItems } = await model.callFunction(
            "/getCalendarView",
            {
              urlParameters: {
                startDateTime: start,
                endDateTime: end,
              },
            }
          );

          const myWorkItems = workItems.map(
            ({ completedDate, activatedDate, isAllDay, ...workItem }) => ({
              ...workItem,
              tags: workItem.tags.results,
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

          model.setProperty("/MyWorkItems", myWorkItems);
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
