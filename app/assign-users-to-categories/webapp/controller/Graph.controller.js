sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  (BaseController, JSONModel) => {
    const nest = (items, ID = null, link = "parent_ID") =>
      items
        .filter((item) => item[link] === ID)
        .map((item) => ({ ...item, children: nest(items, item.ID) }));

    return BaseController.extend(
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
            expandToLevel: 0,
          });

          this.setModel(viewModel, "viewModel");
        },

        async onBeforeRendering() {
          await this.getModel().metadataLoaded();
          this.loadData();
        },

        async loadData() {
          const model = this.getModel();
          const { dateFrom, dateUntil } = this.getModel("viewModel").getData();

          const { results } = await model.callFunction(
            `/getCumulativeCategoryDurations`,
            {
              urlParameters: {
                // dateFrom: "2021-01-05T15:16:23Z",
                // dateUntil: "2023-01-05T15:16:23Z",
                dateFrom,
                dateUntil: dateUntil.toISOString(),
                excludeEmptyDurations: true,
              },
            } // function import parameters
          );

          const categoriesNested = nest(results);

          model.setProperty("/CategoriesCumulativeDurations", categoriesNested);
        },

        expand() {
          const model = this.getModel("viewModel");
          const { expandToLevel } = model.getData();

          this.byId("treeTable").expandToLevel(expandToLevel + 1);
          model.setProperty("/expandToLevel", expandToLevel + 1);
        },

        collapseAll() {
          this.getModel("viewModel").setProperty("/expandToLevel", 0);
          this.byId("treeTable").collapseAll();
        },

        onChangeNumberOfExpandedLevels() {
          const treeTable = this.byId("treeTable");
          const { numberOfExpandedLevels } =
            this.getModel("viewModel").getData();
          treeTable.expandToLevel(numberOfExpandedLevels);
        },

        onRowsUpdated(event) {
          const table = event.getSource();
          const rows = table.getRows();

          rows.forEach((row, index) => {
            if (row.getCells().length === 0) return;
            const progressIndicatorCell = row.getCells()[2];
            const { relativeDuration, relativeAccDuration } = row
              .getBindingContext()
              .getObject();

            if (table.isExpanded(index)) {
              progressIndicatorCell.setPercentValue(relativeDuration);
              progressIndicatorCell.setDisplayValue(`${relativeDuration}%`);
            } else {
              progressIndicatorCell.setPercentValue(relativeAccDuration);
              progressIndicatorCell.setDisplayValue(`${relativeAccDuration}%`);
            }
          });
        },
      }
    );
  }
);
