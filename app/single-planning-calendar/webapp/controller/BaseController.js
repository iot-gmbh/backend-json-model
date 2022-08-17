sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  (Controller, History) =>
    Controller.extend("iot.singleplanningcalendar.controller.BaseController", {
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
       * @param {string} sName the model name
       * @returns {sap.ui.model.Model} the model instance
       */
      getModel(sName) {
        return this.getView().getModel(sName);
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

      async read({ path, ...params }) {
        return new Promise((resolve, reject) => {
          this.getModel("OData").read(path, {
            ...params,
            success: resolve,
            error: reject,
          });
        });
      },

      async callFunction(...args) {
        const [functionName, params] = args;
        return new Promise((resolve, reject) => {
          this.getModel("OData").callFunction(functionName, {
            ...params,
            success: resolve,
            error: reject,
          });
        });
      },

      async update({ path, data }) {
        return new Promise((resolve, reject) => {
          this.getModel("OData").update(path, data, {
            success: resolve,
            error: reject,
          });
        });
      },

      async create({ path, data }) {
        return new Promise((resolve, reject) => {
          this.getModel("OData").create(path, data, {
            success: resolve,
            error: reject,
          });
        });
      },

      async reset({ path, data }) {
        return new Promise((resolve, reject) => {
          this.getModel("OData").update(
            path,
            { ...data, resetEntry: true },
            {
              success: resolve,
              error: reject,
            }
          );
        });
      },

      async remove({ path }) {
        return new Promise((resolve, reject) => {
          this.getModel("OData").remove(path, {
            success: resolve,
            error: reject,
          });
        });
      },

      /**
       * Event handler for navigating back.
       * It there is a history entry we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the master route.
       * @public
       */
      onNavBack() {
        const sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          history.go(-1);
        } else {
          this.getRouter().navTo("master", {}, true);
        }
      },
    })
);
