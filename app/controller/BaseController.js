sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  (Controller, History) =>
    Controller.extend(
      "iot.planner.components.singleplanningcalendar.controller.BaseController",
      {
        getRootComponent() {
          return this.getOwnerComponent()
            .oContainer.getParent()
            .getParent()
            .getController()
            .getOwnerComponent();
        },

        /**
         * Convenience method for accessing the router in every controller of the application.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter() {
          return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @public
         * @param {string} name the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel(name) {
          return (
            this.getView().getModel(name) ||
            this.getOwnerComponent().getModel(name) ||
            this.getRootComponent().getModel(name)
          );
        },

        /**
         * Convenience method for setting the view model in every controller of the application.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel(oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle() {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onNavBack() {
          const sPreviousHash = History.getInstance().getPreviousHash();

          if (sPreviousHash !== undefined) {
            // eslint-disable-next-line no-restricted-globals
            history.go(-1);
          } else {
            this.getOwnerComponent().getRouter().navTo("home", {}, true);
          }
        },
      }
    )
);
