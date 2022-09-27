sap.ui.define(
  [
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/base/Log",
  ],
  (BaseController, formatter, Filter, JSONModel, MessageToast, Log) => {
    // function addDays(date, days) {
    //   const result = new Date(date);
    //   result.setDate(result.getDate() + days);
    //   return result;
    // }

    BaseController.extend(
      "iot.planner.components.workitems.controller.WorkItems",
      {
        formatter,
        async onInit() {
          const viewModel = new JSONModel({
            busy: false,
            tableBusy: true,
            MyCategories: {},
            categoriesNested: {},
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
            // TODO: evtl. entfernen, da nicht mehr benoetigt
            countAll: 0,
            countCompleted: 0,
            countIncompleted: 0,
            checkedProperties: [
              "title",
              "date",
              "activatedDate",
              "completedDate",
              "parentPath",
              "activity",
              "location",
            ],
            // selectedItemPath: {},
            totalDuration: 0,
          });
          this.setModel(viewModel, "viewModel");

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

          this.getRouter()
            .getRoute("workitems")
            .attachPatternMatched(() => this.onRouteMatched(), this);
        },

        async onRouteMatched() {
          try {
            await Promise.all([
              // this._loadWorkItems(),
              this._loadHierarchy(),
            ]);
          } catch (error) {
            Log.error(error);
          }

          this._filterHierarchyByPath("hierarchyTreeForm", "");
        },

        // calcTotalDuration() {
        //   const filteredItemsIndices =
        //     this.byId("tableWorkItems").getBindingInfo("items").binding
        //       .aIndices;
        //   const myWorkItems = this.getModel().getProperty("/MyWorkItems");
        //   let totalDuration = 0;

        //   totalDuration = filteredItemsIndices.reduce((sum, index) => {
        //     if (myWorkItems[index].duration !== "24") {
        //       return sum + parseFloat(myWorkItems[index].duration);
        //     }
        //     return sum;
        //   }, 0);

        //   this.getModel("viewModel").setProperty("/totalDuration", totalDuration);
        // },

        async _loadHierarchy() {
          const backendJSONModel = this.getModel("backendJSONModel");
          const viewModel = this.getModel("viewModel");
          try {
            const { results } = await backendJSONModel.callFunction(
              "/getMyCategoryTree"
            );
            const categoriesNested = backendJSONModel.nest({ items: results });

            viewModel.setProperty("/MyCategories", results);
            viewModel.setProperty("/MyCategoriesNested", categoriesNested);
          } catch (error) {
            Log.error(error);
          }
        },

        onChangeHierarchy(event) {
          const selectedItemPath = event
            .getSource()
            .getBindingContext()
            .getPath();
          this.getModel("viewModel").setProperty(
            "/selectedItemPath",
            selectedItemPath
          );
          const popover = this.byId("hierarchyPopover");
          const input = event.getSource();

          popover.openBy(input);
          setTimeout(() => input.focus());
          const { newValue } = event.getParameters();

          this._filterHierarchyByPath(newValue);
        },

        _filterHierarchyByPath(query) {
          let filters = [];

          if (!query) {
            filters = new Filter("title", "EQ", null);
          } else if (query.includes(">")) {
            filters = [
              new Filter({
                path: "path",
                test: (path) => {
                  if (!query || !path) return false;
                  const pathSubstrings = path.replaceAll(" ", "").split(">");
                  const querySubstrings = query
                    .toUpperCase()
                    .replaceAll(" ", "")
                    .split(">");

                  return querySubstrings.every(
                    (querySubstring, index) =>
                      pathSubstrings[index] &&
                      pathSubstrings[index].includes(querySubstring)
                  );
                },
              }),
            ];
          } else {
            filters = [
              new Filter({
                filters: [
                  new Filter({
                    path: "path",
                    test: (path) => {
                      if (!query || !path) return false;
                      const substrings = query.split(" ");
                      return substrings
                        .map((sub) => sub.toUpperCase())
                        .every((sub) => path.includes(sub));
                    },
                  }),
                  new Filter({
                    path: "absoluteReference",
                    test: (absoluteReference) => {
                      if (!query || !absoluteReference) return false;
                      const substrings = query.split(" ");
                      return substrings
                        .map((sub) => sub.toUpperCase())
                        .every((sub) => absoluteReference.includes(sub));
                    },
                  }),
                  new Filter({
                    path: "deepReference",
                    test: (deepReference) => {
                      if (!query || !deepReference) return false;
                      const substrings = query.split(" ");
                      return substrings
                        .map((sub) => sub.toUpperCase())
                        .every((sub) => deepReference.includes(sub));
                    },
                  }),
                ],
                and: false,
              }),
            ];
          }

          const tree = this.byId("hierarchyTreeTable");
          tree.getBinding("rows").filter(filters);

          tree.getRows().forEach((row) => {
            const titleCell = row.getCells()[0];

            if (!titleCell) return;

            const htmlText = titleCell
              .getHtmlText()
              .replaceAll("<strong>", "")
              .replaceAll("</strong>", "");

            titleCell.setHtmlText(htmlText);

            if (!query) return;

            const querySubstrings = query.split(/>| /);

            const newText = querySubstrings.reduce(
              (text, sub) => text.replace(sub, `<strong>${sub}</strong>`),
              htmlText
            );

            titleCell.setHtmlText(newText);
          });
        },

        onSelectHierarchy(event) {
          const { rowContext } = event.getParameters();

          if (!rowContext) return;

          const workItemPath =
            this.getModel("viewModel").getProperty("/selectedItemPath");
          const hierarchyPath = rowContext.getProperty("path");

          this.getModel().setProperty(
            `${workItemPath}/parentPath`,
            hierarchyPath
          );
        },

        // onFilterWorkItems(event) {
        //   const binding = this.byId("tableWorkItems").getBinding("items");
        //   const key = event.getSource().getSelectedKey();
        //   binding.filter(this._filters[key]);
        // },

        // onUpdateTableFinished(event) {
        // this.setItemCountsFilters(event);
        // this.calcTotalDuration();
        // },

        // setItemCountsFilters(event) {
        //   const totalItems = event.getParameter("total");

        //   if (
        //     totalItems &&
        //     event.getSource().getBinding("items").isLengthFinal()
        //   ) {
        //     const model = this.getModel();
        //     const viewModel = this.getModel("viewModel");

        //     const countAll = model
        //       .getProperty("/MyWorkItems")
        //       .filter((workItem) => workItem.state !== "").length;

        //     const countCompleted = model
        //       .getProperty("/MyWorkItems")
        //       .filter((workItem) => workItem.state === "completed").length;

        //     const countIncompleted = model
        //       .getProperty("/MyWorkItems")
        //       .filter((workItem) => workItem.state === "incompleted").length;

        //     viewModel.setProperty("/countAll", countAll);
        //     viewModel.setProperty("/countCompleted", countCompleted);
        //     viewModel.setProperty("/countIncompleted", countIncompleted);
        //   }
        // },

        async onPressDeleteWorkItems() {
          const backendJSONModel = this.getModel("backendJSONModel");
          const table = this.byId("tableWorkItems");
          const workItemsToDelete = table
            .getSelectedContexts()
            .map((context) => context.getObject());

          try {
            await Promise.all(
              workItemsToDelete.map((workItem) => {
                if (workItem.type === "Manual")
                  return backendJSONModel.remove(workItem);
                return backendJSONModel.callFunction("/removeDraft", {
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

          table.getBinding("items").refresh();
          MessageToast.show(`Deleted ${workItemsToDelete.length} work items.`);
        },

        onSearch(event) {
          const paths = ["parentPath", "title", "activity", "location"];
          const operator = "Contains";
          const query = event.getSource().getValue();
          // const caseSensitive = false;
          const filters = [
            new Filter({
              filters: paths.map((path) => new Filter(path, operator, query)),
            }),
          ];
          this.byId("tableWorkItems").getBinding("items").filter(filters);
        },

        submitChanges() {
          const model = this.getModel();
          const viewModel = this.getModel("viewModel");

          if (!model.hasPendingChanges()) {
            return Promise.resolve();
          }

          viewModel.setProperty("/busy", true);

          return new Promise((resolve, reject) => {
            model.submitChanges({
              // groupId: "changes",

              success: () => {
                if (model.hasPendingChanges()) return reject();

                return resolve();
              },

              error: reject,
            });
          }).finally(() => {
            viewModel.setProperty("/busy", false);
          });
        },

        // async updateWorkItem(event) {
        //   const bindingContext = event.getSource().getBindingContext();
        //   const localPath = bindingContext.getPath();
        //   const workItem = bindingContext.getObject();
        //   try {
        //     await this.getModel().update({ ...workItem, localPath });
        //   } catch (error) {
        //     Log.error(error);
        //   }
        //   this.updateWorkItemState(workItem, localPath);
        // },

        // async updateWorkItemActivity(event) {
        //   const bindingContext = event.getSource().getBindingContext();
        //   const localPath = bindingContext.getPath();
        //   const workItem = bindingContext.getObject();
        //   const selectedKey = event.getSource().getSelectedKey();

        //   workItem.activity = selectedKey;

        //   try {
        //     await this.getModel("viewModel").update({ ...workItem, localPath });
        //   } catch (error) {
        //     Log.error(error);
        //   }

        //   this.updateWorkItemState(workItem, localPath);
        // },

        // async updateWorkItemDates(event) {
        //   const bindingContext = event.getSource().getBindingContext();
        //   const localPath = bindingContext.getPath();
        //   const workItem = bindingContext.getObject();

        //   const month = workItem.date.getUTCMonth();
        //   const day = workItem.date.getDate();
        //   const year = workItem.date.getUTCFullYear();

        //   workItem.activatedDate.setFullYear(year, month, day);
        //   workItem.completedDate.setFullYear(year, month, day);

        //   try {
        //     await this.getModel("viewModel").update({ ...workItem, localPath });
        //   } catch (error) {
        //     Log.error(error);
        //   }

        //   this.updateWorkItemState(workItem, localPath);
        // },

        // async updateWorkItemLocation(event) {
        //   const bindingContext = event.getSource().getBindingContext();
        //   const localPath = bindingContext.getPath();
        //   const workItem = bindingContext.getObject();
        //   const value = event.getParameters().newValue;

        //   workItem.location = value;

        //   try {
        //     await this.getModel("viewModel").update({ ...workItem, localPath });
        //   } catch (error) {
        //     Log.error(error);
        //   }

        //   this.updateWorkItemState(workItem, localPath);
        // },

        // async updateWorkItemState(workItem, localPath) {
        //   const checkedProperties =
        //     this.getModel("viewModel").getProperty("/checkedProperties");
        //   let isCompleted = true;

        //   // eslint-disable-next-line no-restricted-syntax
        //   for (const property of checkedProperties) {
        //     if (
        //       workItem[property] === undefined ||
        //       workItem[property] === null ||
        //       workItem[property].toString().trim() === ""
        //     ) {
        //       isCompleted = false;
        //       break;
        //     }
        //   }

        //   // eslint-disable-next-line no-unused-expressions
        //   isCompleted
        //     ? // eslint-disable-next-line no-param-reassign
        //       (workItem.state = "completed")
        //     : // eslint-disable-next-line no-param-reassign
        //       (workItem.state = "incompleted");

        //   try {
        //     await this.getModel().update({ ...workItem, localPath });
        //   } catch (error) {
        //     Log.error(error);
        //   }
        // },
      }
    );
  }
);
