sap.ui.define(["./BaseController"], (BaseController) =>
  BaseController.extend(
    "iot.planner.components.managecategories.controller.NotFound",
    {
      /**
       * Navigates to the worklist when the link is pressed
       * @public
       */
      onLinkPressed() {
        this.getRouter().navTo("worklist");
      },
    }
  )
);
