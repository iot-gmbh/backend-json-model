sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/base/Log",
  ],
  (BaseController, formatter, Filter, FilterOperator, MessageToast, Log) => {
    function addMinutes(date, minutes) {
      return new Date(date.getTime() + minutes * 60000);
    }

    function roundTimeQuarterHour(time) {
      const timeToReturn = new Date(time);

      timeToReturn.setMilliseconds(
        Math.round(timeToReturn.getMilliseconds() / 1000) * 1000
      );
      timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
      timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
      return timeToReturn;
    }

    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    BaseController.extend(
      "iot.planner.components.workitemsfastentry.controller.WorkItemsFastEntry",
      {
        formatter,
        async onInit() {
          this._filterHierarchyByPath("hierarchyTreeForm", "");
          this.searchFilters = [];
          this._filters = {
            all: new Filter({
              path: "state",
              operator: "NE",
              value1: "",
            }),
            completed: new Filter({
              path: "state",
              operator: "EQ",
              value1: "completed",
            }),
            incompleted: new Filter({
              path: "state",
              operator: "EQ",
              value1: "incompleted",
            }),
          };
        },

        async onBeforeRendering() {
          const model = this.getModel();
          const loadFrom = new Date();
          loadFrom.setHours(0, 0, 0, 0); // last midnight
          const loadUntil = new Date();
          loadUntil.setHours(24, 0, 0, 0); // next midnight

          model.setData({
            newWorkItem: {},
            busy: false,
            tableBusy: true,
            MyCategories: {},
            categoriesNested: {},
            // TODO: Entität im Schema erstellen und aus ODataModel beziehen
            activities: [
              { title: "Durchführung" },
              { title: "Reise-/Fahrzeit" },
              { title: "Pendelfahrt Hotel/Einsatzort" },
            ],
            // TODO: Entität im Schema erstellen und aus ODataModel beziehen
            locations: [
              { title: "IOT" },
              { title: "Home-Office" },
              { title: "Rottendorf" },
            ],
            countAll: 0,
            countCompleted: 0,
            countIncompleted: 0,
          });

          this.setNewWorkItemTemplate();

          try {
            await Promise.all([
              this._loadWorkItems({
                startDateTime: loadFrom,
                endDateTime: loadUntil,
              }),
              this._loadHierarchy(),
            ]);
          } catch (error) {
            Log.error(error);
          }

          model.setProperty("/tableBusy", false);
        },

        setNewWorkItemTemplate(overwrite) {
          const newWorkItemTemplate = {
            title: "",
            tags: [],
            date: new Date(),
            activatedDate: roundTimeQuarterHour(new Date()),
            completedDate: roundTimeQuarterHour(addMinutes(new Date(), 15)),
            parentPath: "",
            // TODO: activity erst im DB-Schema und an weiteren Stellen hinzufügen
            // activity: '',
            // TODO: location erst im DB-Schema und an weiteren Stellen hinzufügen
            // location: '',
            type: "Manual",
            state: "incompleted",
            ...overwrite,
          };

          this.getModel().setProperty("/newWorkItem", newWorkItemTemplate);
        },

        async _loadWorkItems({ startDateTime, endDateTime }) {
          const model = this.getModel();

          model.setProperty("/busy", true);

          try {
            const { results: workItems } = await model.callFunction(
              "/getCalendarView",
              {
                urlParameters: {
                  startDateTime,
                  endDateTime,
                },
              }
            );

            const appointments = workItems.map(
              ({ completedDate, activatedDate, isAllDay, ...appointment }) => ({
                ...appointment,
                tags: appointment.tags.results,
                activatedDate: isAllDay
                  ? new Date(activatedDate.setHours(0))
                  : activatedDate,
                completedDate: isAllDay
                  ? addDays(completedDate.setHours(0), -1)
                  : completedDate,
              })
            );

            model.setProperty("/MyWorkItems", appointments);
            model.setProperty("/busy", false);
          } catch (error) {
            Log.error(error);
          }
        },

        async _loadHierarchy() {
          const model = this.getModel();
          try {
            const { results } = await model.callFunction("/getMyCategoryTree");
            const categoriesNested = model.nest({ items: results });

            model.setProperty("/MyCategories", results);
            model.setProperty("/MyCategoriesNested", categoriesNested);
          } catch (error) {
            Log.error(error);
          }
        },

        onChangeHierarchy(event) {
          let associatedHierarchyTreeID;
          if (event.getParameter("id").endsWith("Form")) {
            this.getModel().setProperty("/showHierarchyTreeForm", true);
            associatedHierarchyTreeID = "hierarchyTreeForm";
            const { newValue } = event.getParameters();

            this._filterHierarchyByPath(associatedHierarchyTreeID, newValue);
          }
        },

        _filterHierarchyByPath(elementID, query) {
          const filters = [
            new Filter({
              path: "path",
              test: (path) => {
                if (!query) return false;
                const substrings = query.split(" ");
                return substrings
                  .map((sub) => sub.toUpperCase())
                  .every((sub) => path.includes(sub));
              },
            }),
          ];
          this.byId(elementID).getBinding("items").filter(filters);
        },

        onSelectHierarchy(event) {
          if (event.getParameter("id").endsWith("Form")) {
            const { listItem } = event.getParameters();
            const hierarchyPath = listItem
              .getBindingContext()
              .getProperty("path");

            this.getModel().setProperty(
              "/newWorkItem/parentPath",
              hierarchyPath
            );
          } else {
            const { listItem } = event.getParameters();
            const hierarchyPath = listItem
              .getBindingContext()
              .getProperty("path");
            const path = event.getSource().getBindingContext().getPath();

            this.getModel().setProperty(`${path}/parentPath`, hierarchyPath);
          }
        },

        onFilterWorkItems(event) {
          const binding = this.byId("tableWorkItems").getBinding("items");
          const key = event.getSource().getSelectedKey();
          binding.filter(this._filters[key]);
        },

        setItemCountsFilters(event) {
          const totalItems = event.getParameter("total");

          if (
            totalItems &&
            event.getSource().getBinding("items").isLengthFinal()
          ) {
            const model = this.getModel();

            const countAll = model
              .getProperty("/MyWorkItems")
              .filter((workItem) => workItem.state !== "").length;

            const countCompleted = model
              .getProperty("/MyWorkItems")
              .filter((workItem) => workItem.state === "completed").length;

            const countIncompleted = model
              .getProperty("/MyWorkItems")
              .filter((workItem) => workItem.state === "incompleted").length;

            model.setProperty("/countAll", countAll);
            model.setProperty("/countCompleted", countCompleted);
            model.setProperty("/countIncompleted", countIncompleted);
          }
        },

        onSearch(event) {
          this.searchFilters = [];
          this.searchQuery = event.getSource().getValue();

          if (this.searchQuery && this.searchQuery.length > 0) {
            this.searchFilters = new Filter(
              "text",
              FilterOperator.Contains,
              this.searchQuery
            );
          }

          this.byId("table").getBinding("items").filter(this.searchFilters);
        },

        async onPressAddWorkItem() {
          const model = this.getModel();
          const newWorkItem = model.getProperty("/newWorkItem");

          const month = newWorkItem.date.getUTCMonth();
          const day = newWorkItem.date.getUTCDate();
          const year = newWorkItem.date.getUTCFullYear();

          newWorkItem.activatedDate.setFullYear(year, month, day);
          newWorkItem.completedDate.setFullYear(year, month, day);

          // this.checkCompleteness();

          model.setProperty("/busy", true);

          try {
            await model.create("/MyWorkItems", {
              localPath: "/MyWorkItems/X",
              ...newWorkItem,
            });
          } catch (error) {
            Log.error(error);
          }

          this.setNewWorkItemTemplate({
            activatedDate: newWorkItem.completedDate,
            completedDate: roundTimeQuarterHour(
              addMinutes(newWorkItem.completedDate, 15)
            ),
          });

          model.setProperty("/busy", false);
        },

        async onPressDeleteWorkItems() {
          const model = this.getModel();
          const table = this.byId("tableWorkItems");
          const workItemsToDelete = table
            .getSelectedContexts()
            .map((context) => context.getObject());

          try {
            await Promise.all(
              workItemsToDelete.map((workItem) => {
                if (workItem.type === "Manual") return model.remove(workItem);
                return model.callFunction("/removeDraft", {
                  method: "POST",
                  urlParameters: {
                    ID: workItem.ID,
                    activatedDate: workItem.activatedDate,
                    completedDate: workItem.completedDate,
                  },
                });
              })
            );
          } catch (error) {
            Log.error(error);
          }

          const data = model.getProperty("/MyWorkItems").filter((entity) => {
            const keepItem = !workItemsToDelete
              .map((wi) => wi.__metadata.uri)
              .includes(entity.__metadata.uri);
            return keepItem;
          });

          model.setProperty("/MyWorkItems", data);

          table.removeSelections();

          MessageToast.show(`Deleted ${workItemsToDelete.length} work items.`);
        },

        async updateWorkItem(event) {
          const bindingContext = event.getSource().getBindingContext();
          const localPath = bindingContext.getPath();
          const workItem = bindingContext.getObject();

          try {
            await this.getModel().update({ ...workItem, localPath });
          } catch (error) {
            Log.error(error);
          }
        },
      }
    );
  }
);
