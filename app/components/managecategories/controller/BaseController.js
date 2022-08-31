sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "../model/formatter",
  ],
  (Controller, UIComponent, mobileLibrary, formatter) => {
    // shortcut for sap.m.URLHelper
    const { URLHelper } = mobileLibrary;

    return Controller.extend(
      "iot.planner.components.managecategories.controller.BaseController",
      {
        formatter,
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter() {
          return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel(sName) {
          return (
            this.getView().getModel(sName) ||
            this.getOwnerComponent().getModel(sName)
          );
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel(oModel, sName) {
          return this.getView().setModel(oModel, sName);
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

        async create({ path, data }) {
          return new Promise((resolve, reject) => {
            this.getModel("OData").create(path, data, {
              success: resolve,
              error: reject,
            });
          });
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle() {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onShareEmailPress() {
          const oViewModel =
            this.getModel("objectView") || this.getModel("worklistView");
          URLHelper.triggerEmail(
            null,
            oViewModel.getProperty("/shareSendEmailSubject"),
            oViewModel.getProperty("/shareSendEmailMessage")
          );
        },
      }
    );
  }
);
