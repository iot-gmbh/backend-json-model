sap.ui.define([], function () {
  return sap.ui.controller(
    "iot.planner.workitemsalp.ext.AnalyticalListPageExt",
    {
      onBeforeRendering: async function () {
        // Get reference to SmartFilterBar
        const smartFilterBar = this.getView().byId(
          "iot.planner.workitemsalp::sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage::WorkItems--template::SmartFilterBar"
        );

        await smartFilterBar.getModel().metadataLoaded();

        const date = new Date(),
          y = date.getFullYear(),
          m = date.getMonth();
        const firstDay = new Date(y, m, 1);
        const lastDay = new Date(y, m + 1, 0);

        const defaultFilter = {
          activatedDate: {
            ranges: [
              {
                exclude: false,
                keyField: "activatedDate",
                operation: "GE",
                value1: firstDay,
              },
            ],
            value: firstDay,
          },
          completedDate: {
            ranges: [
              {
                exclude: false,
                keyField: "completedDate",
                operation: "LE",
                value1: lastDay,
              },
            ],
            value: lastDay,
          },
        };

        //Default the Global filter values
        setTimeout(() => smartFilterBar.setFilterData(defaultFilter), 20);
      },
    }
  );
});
