XMLHttpRequest.prototype.origOpen = XMLHttpRequest.prototype.open;

sap.ui.define(
  ["sap/ui/Device", "sap/ui/model/json/JSONModel", "sap/ui/core/UIComponent"],
  (Device, JSONModel, UIComponent) =>
    UIComponent.extend("iot.planner.Component", {
      config: {
        msalConfig: {
          auth: {
            clientId: "0fca317b-6113-43e2-8cfd-bf7053bbbf12",
            authority: "https://login.microsoftonline.com/common",
            validateAuthority: false,
          },
          cache: {
            cacheLocation: "localStorage",
            storeAuthStateInCookie: true,
          },
        },
        scopes: ["api://88af1bc6-ac4f-4ba6-bd0a-96c54b3aa437/.default"],
      },

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

      async init(...args) {
        UIComponent.prototype.init.apply(this, ...args);

        const router = this.getRouter();

        this.setModel(new JSONModel({}), "session");

        // if (!this._myMsal) {
        //   this._myMsal = new msal.PublicClientApplication(
        //     this.config.msalConfig
        //   );
        // }

        // await this.login();

        // // const subcomponents = this.getSubcomponents()
        // this.getRouter().attachBeforeRouteMatched((event) => {
        //   this._checkIsAuthenticated(event);
        // });

        // create the views based on the url/hash
        router.initialize();
      },

      getSubcomponents() {
        const subcomponents = Object.values(
          this.getManifestEntry("/sap.ui5/componentUsages")
        ).map(({ name }) => sap.ui.component(name));

        return subcomponents;
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
