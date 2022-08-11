sap.ui.define(["./BaseController"], (BaseController) =>
  BaseController.extend(
    "iot.planner.assignuserstocategories.controller.Graph",
    {
      async onBeforeRendering() {
        const model = this.getModel();

        const categories = await this.getModel().load("/Categories", {
          urlParameters: { $expand: "members,tags" },
        });

        const categoriesLevel0 = categories.filter(
          ({ parent_ID }) => !parent_ID
        );

        model.setProperty("/categoriesLevel0", categoriesLevel0);
      },
    }
  )
);
