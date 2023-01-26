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

    function treatAsUTC(date) {
      const result = new Date(date);
      result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
      return result;
    }

    function daysBetween(startDate, endDate) {
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
    }

    const gsDayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return BaseController.extend(
      "iot.planner.components.singleplanningcalendar.controller.SingleEntry",
      {
        formatter,

        async onInit() {
          const bundle = this.getResourceBundle();
          const router = this.getRouter();
          const relevantRoutes = [
            router.getRoute("singleEntry"),
            router.getRoute("masterDetail"),
          ];

          relevantRoutes.forEach((route) => {
            route.attachPatternMatched(async () => {
              await this.getRootComponent().awaitLogin;

              await this.initModel();

              const firstWorkItem =
                this.getModel().getProperty("/MyWorkItems/0");
              const detailPage = this.byId("detailPage");

              if (firstWorkItem) {
                detailPage.bindElement("/MyWorkItems/0");
              } else {
                this._initNewWorkItem();
                detailPage.bindElement("/MyWorkItems/NEW");
              }
            }, this);
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

        async initModel() {
          const bundle = this.getResourceBundle();
          const model = this.getModel();

          model.setProperty("/busyIndicatorDelay", 0);
          model.setProperty("/busy", true);

          try {
            // await this.getRootComponent().awaitLogin;
            // await model.metadataLoaded();
          } catch (error) {
            // handled by errorhandler
            model.setProperty("/busy", false);
            return;
          }

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
            total: { is: 0, should: 0 },
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

          this._setTargetWorkingTime();
          this._bindMasterList();
          // Otherwise new entries won't be displayed in the calendar
          model.setSizeLimit(300);

          try {
            await Promise.all([
              this._loadWorkItems().then(() =>
                // Initially only work items are perceived by the user => we don't need to wait for the hierarchy
                model.setProperty("/busy", false)
              ),
              this._loadHierarchy(),
            ]);
          } catch (error) {
            // ignore gracefully => handled by errorhandler
          }

          model.setProperty("/busy", false);
          model.setProperty("/busyIndicatorDelay", 1000);
        },

        onMasterListUpdateFinished() {
          const total = this.byId("masterList")
            .getItems()
            .map((item) => item.getBindingContext()?.getProperty("duration"))
            .map((value) => Number(value))
            .filter(Boolean)
            .reduce((sum, curr) => sum + curr, 0);

          this.getModel().setProperty("/total/is", total.toFixed(0));
        },

        async onPressDeleteWorkItem(event) {
          const workItem = event.getSource().getBindingContext().getObject();

          this._deleteWorkItem(workItem);
        },

        async _deleteWorkItem(workItem) {
          const model = this.getModel();
          const keyOfNextItem = this._getKeyOfNextItem();

          model.setProperty("/busy", true);

          // TODO: Refactor performance improvements
          workItem.__metadata.uri = workItem.__metadata.uri.replace(
            "WorkItemsSlim",
            "MyWorkItems"
          );

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

            setTimeout(() => this._selectItemByKey(keyOfNextItem));
          } catch (error) {
            Log.error(error);
          }

          model.setProperty("/busy", false);
        },

        _selectItemByKey(key) {
          if (!key) return; // might be the last entry and we have no successor => return
          const masterList = this.byId("masterList");
          const item = masterList
            .getItems()
            .find((itm) => this._getItemKey(itm) === key);

          masterList.setSelectedItem(item);
          this.byId("detailPage").bindElement(
            item.getBindingContext().getPath()
          );
        },

        _getKeyOfNextItem() {
          const masterList = this.byId("masterList");
          const selectedIndex = masterList
            .getItems()
            .findIndex(
              (item) =>
                this._getItemKey(item) ===
                this._getItemKey(masterList.getSelectedItem())
            );

          const nextItem = masterList.getItems()[selectedIndex + 1];
          // If the next item is a group header => skip to the next but one
          const nextButOneItem = masterList.getItems()[selectedIndex + 2];

          if (nextItem && nextItem.getBindingContext())
            return this._getItemKey(nextItem);
          if (nextButOneItem && nextButOneItem.getBindingContext())
            return this._getItemKey(nextButOneItem);

          return undefined;
        },

        _getItemKey(item) {
          if (!item.getBindingContext()) return false;
          return item.getBindingContext().getObject().__metadata?.uri;
        },

        _setTargetWorkingTime() {
          const model = this.getModel();
          const {
            filters: {
              date: { end, start },
            },
          } = model.getData();
          const noOfDaysBetween = daysBetween(start, end);

          model.setProperty("/total/should", (noOfDaysBetween * 8).toFixed(0));
        },

        async refreshMasterList() {
          this._setTargetWorkingTime();
          await this._loadWorkItems();

          this._bindMasterList();
        },

        _bindMasterList() {
          const model = this.getModel();
          const resBundle = this.getResourceBundle();
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
                const date = new Date(dateString);
                const dayName = resBundle.getText(gsDayNames[date.getDay()]);
                const totalDuration = workItems
                  .filter((item) => item.dateString === dateString)
                  .reduce(
                    (sum, { activatedDate, completedDate }) =>
                      sum + (completedDate - activatedDate),
                    0
                  )
                  .toFixed(2);

                return {
                  key: `${dayName}, ${dateString}`,
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

              const clone = template.clone(controlID);
              clone.setInfoStateInverted(!!overlap);

              return clone;
            },
            // template,
            filters,
          });
        },

        _initNewWorkItem(startDate = roundTimeToQuarterHour(Date.now())) {
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
          const splitApp = this.byId("splitApp");
          const detailPage = this.byId("detailPage");
          const startDate = detailPage
            .getBindingContext()
            .getProperty("completedDate");

          this._initNewWorkItem(startDate);
          detailPage.bindElement("/MyWorkItems/NEW");
          splitApp.hideMaster();
          this.byId("titleInput").focus();
        },

        onSelectionChange(event) {
          const { listItem } = event.getParameters();
          if (!listItem.getBindingContext()) return; // Group headers don't have a context

          const selectedID = listItem.getBindingContext().getProperty("ID");
          const index = this.getModel()
            .getProperty("/MyWorkItems")
            .findIndex(({ ID }) => ID === selectedID);

          this.byId("detailPage").bindElement(`/MyWorkItems/${index}`);
          this.getModel().setProperty("/MyCategoriesNestedAndFiltered", []);
          this.byId("splitApp").toDetail(this.byId("detailPage"));
        },

        onPressToggleMaster() {
          const splitApp = this.byId("splitApp");

          if (splitApp.isMasterShown()) {
            splitApp.toDetail(this.byId("detailPage"));
          } else {
            splitApp.toMaster(this.byId("masterPage"));
          }
        },

        onSelectHierarchy(event) {
          const { rowContext } = event.getParameters();

          if (!rowContext) return;

          const hierarchyPath = rowContext.getProperty("path");
          const path = event.getSource().getBindingContext().getPath();

          this.getModel().setProperty(`${path}/parentPath`, hierarchyPath);
        },

        onLiveChangeHierarchy(event) {
          const { newValue } = event.getParameters();
          this._filterHierarchyByPath(newValue);
        },

        onChangeHierarchy(event) {
          const hierarchySearch = event.getSource();
          hierarchySearch.setValueState("None");
          hierarchySearch.setValueStateText();
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

            this._initNewWorkItem(workItem.completedDate);
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
          const hierarchySearch = this.byId("hierarchySearch");
          const model = this.getModel();
          const { MyCategories } = model.getData();
          const parent = MyCategories.find(
            (cat) => cat.path === workItem.parentPath
          );

          if (!parent) {
            const error = new Error(
              "No category selected. Please select an existing category from the hierarchy."
            );
            MessageBox.error(error.message);

            hierarchySearch.setValueState("Error");
            hierarchySearch.setValueStateText(error.message);

            throw error;
          } else {
            hierarchySearch.setValueState("None");
            hierarchySearch.setValueStateText();
          }

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

          if (data.completedDate <= data.activatedDate) {
            const error = new Error(
              "The completion date must be after the start date. Please provide a plausibel combination of dates."
            );
            MessageBox.error(error.message);
            throw error;
          }

          // Update
          if (data.ID) {
            const updatedItem = await model.update(data);

            this.byId("hierarchySearch").focus();
            model.setProperty("/MyCategoriesNestedAndFiltered", []);

            return updatedItem;
          }

          return model.create("/WorkItemsSlim", data);
        },

        async _loadWorkItems() {
          const model = this.getModel();
          const { start, end } = model.getProperty("/filters/date");

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
              // tags: workItem.tags.results,
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
        },

        async _loadHierarchy() {
          const model = this.getModel();

          try {
            const { results } = await model.callFunction("/getMyCategoryTree");
            const categoriesNested = model.nest({ items: results });

            model.setProperty("/MyCategories", results);
            model.setProperty("/MyCategoriesNested", categoriesNested);
            model.setProperty("/MyCategoriesNestedAndFiltered", []);
          } catch (error) {
            Log.error(error);
          }
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
