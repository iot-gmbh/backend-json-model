sap.ui.define(
  ["sap/ui/Device", "sap/ui/model/json/JSONModel", "sap/ui/core/UIComponent"],
  (Device, JSONModel, UIComponent) =>
    UIComponent.extend("iot.planner.Component", {
      metadata: {
        manifest: "json",
        events: {
          login: {
            parameters: {
              session: { type: "object" },
            },
          },
          logout: { parameters: {} },
        },
      },

      init(...args) {
        UIComponent.prototype.init.apply(this, ...args);

        const router = this.getRouter();

        this.setModel(new JSONModel({}), "session");

        // create the views based on the url/hash
        router.initialize();
      },

      /**
       * The component is destroyed by UI5 automatically.
       * In this method, the ErrorHandler is destroyed.
       * @public
       * @override
       */
      destroy(...args) {
        // call the base component's destroy function
        UIComponent.prototype.destroy.apply(this, args);
      },

      /**
       * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
       * design mode class should be set, which influences the size appearance of some controls.
       * @public
       * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
       */
      getContentDensityClass() {
        if (this._sContentDensityClass === undefined) {
          // check whether FLP has already set the content density class; do nothing in this case
          if (
            document.body.classList.contains("sapUiSizeCozy") ||
            document.body.classList.contains("sapUiSizeCompact")
          ) {
            this._sContentDensityClass = "";
          } else if (!Device.support.touch) {
            // apply "compact" mode if touch is not supported
            this._sContentDensityClass = "sapUiSizeCompact";
          } else {
            // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
            this._sContentDensityClass = "sapUiSizeCozy";
          }
        }
        return this._sContentDensityClass;
      },
    })
);
