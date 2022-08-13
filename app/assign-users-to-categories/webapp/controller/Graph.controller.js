const nest = (items, ID = null, link = "parent_ID") =>
  items
    .filter((item) => item[link] === ID)
    .map((item) => ({ ...item, children: nest(items, item.ID) }));

sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  (BaseController, JSONModel) =>
    BaseController.extend(
      "iot.planner.assignuserstocategories.controller.Graph",
      {
        onInit() {
          const dateFrom = new Date();
          dateFrom.setFullYear(2021); // last midnight
          const dateUntil = new Date();
          dateUntil.setHours(24, 0, 0, 0); // last midnight

          const viewModel = new JSONModel({
            dateFrom,
            dateUntil,
          });

          this.setModel(viewModel, "viewModel");
        },

        onBeforeRendering() {
          this.loadData();
        },

        async loadData() {
          const model = this.getModel();
          const { dateFrom, dateUntil } = this.getModel("viewModel").getData();

          const { results } = await model.callFunction(
            `/getCumCategoryExpenses`,
            {
              urlParameters: {
                // dateFrom: "2021-01-05T15:16:23Z",
                // dateUntil: "2023-01-05T15:16:23Z",
                dateFrom: dateFrom.toISOString(),
                dateUntil: dateUntil.toISOString(),
                includeEmpty: false,
              },
            } // function import parameters
          );

          const categoriesNested = nest(results);

          model.setProperty("/CategoriesCumulativeExpenses", categoriesNested);
        },
      }
    )
);
