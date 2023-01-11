sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  (BaseController, JSONModel) => {
    const nest = (items, ID = null, link = "parent_ID") =>
      items
        .filter((item) => item[link] === ID)
        .map((item) => ({ ...item, children: nest(items, item.ID) }));

    return BaseController.extend(
      "iot.planner.components.managecategories.controller.Graph",
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

        sortDecimals(value1, value2) {
          const val1 = parseFloat(value1);
          const val2 = parseFloat(value2);

          if (val1 < val2) return 1;
          if (val1 === val2) return 0;
          return -1;
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
            if (!row.getBindingContext()) return;
            const progressIndicatorCell = row.getCells()[2];
            const { relativeDuration, relativeAccDuration } = row
              .getBindingContext()
              .getObject();

            const relativeDurationParsed =
              parseFloat(relativeDuration).toFixed(0);
            const relativeAccDurationParsed =
              parseFloat(relativeAccDuration).toFixed(0);

            if (table.isExpanded(index)) {
              progressIndicatorCell.setPercentValue(relativeDurationParsed);
              progressIndicatorCell.setDisplayValue(
                `${relativeDurationParsed}%`
              );
            } else {
              progressIndicatorCell.setPercentValue(relativeAccDurationParsed);
              progressIndicatorCell.setDisplayValue(
                `${relativeAccDurationParsed}%`
              );
            }
          });
        },
      }
    );
  }
);
