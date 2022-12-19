sap.ui.define(
  [
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "iot/BackendJSONModel",
    "errorhandler/ErrorHandler",
  ],
  (Device, JSONModel, UIComponent, BackendJSONModel, ErrorHandler) =>
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

        if (!this._myMsal) {
          this._myMsal = new msal.PublicClientApplication(
            this.config.msalConfig
          );
        }

        const session = await this.login();

        // const subcomponents = this.getSubcomponents();
        // subcomponents.forEach((component) =>
        //   component.attachEventOnce("init", (event) => {
        //     component
        //       .getModel()
        //       .setHeaders({ Authorization: `Bearer ${session.accessToken}` });
        //   })
        // );

        this.getRouter().attachBeforeRouteMatched((event) => {
          this._checkIsAuthenticated(event);
        });

        this.getRouter().attachRouteMatched((event) => {
          const { view } = event.getParameters();

          const component = sap.ui.core.Component.registry.get(
            view.getComponent()
          );

          component
            .getModel()
            .setHeaders({ Authorization: `Bearer ${session.accessToken}` });
        });

        // create the views based on the url/hash
        router.initialize();
      },

      getSubcomponents() {
        const subcomponents = Object.values(
          this.getManifestEntry("/sap.ui5/componentUsages")
        ).map(({ name }) => sap.ui.component(name));

        return subcomponents;
      },

      async _checkIsAuthenticated() {
        const session = this.getModel("session");
        if (!session.getProperty("/idToken")) {
          setTimeout(() =>
            this.getRouter().getTargets().display("notAuthenticated")
          );
        }
      },

      async login() {
        this.awaitLogin = this._login();

        return this.awaitLogin;
      },

      async _login() {
        const account = this._myMsal.getAllAccounts()[0];

        const previousPage = this._previousPage; // set as variable so it won't be lost after the login-dialog
        const previousTarget = this._previousTarget; // set as variable so it won't be lost after the login-dialog

        const accessTokenRequest = {
          scopes: this.config.scopes,
          account,
        };

        let loginResponse = {};

        if (account) {
          try {
            loginResponse = await this._myMsal.acquireTokenSilent(
              accessTokenRequest
            );
          } catch (error) {
            // Acquire token silent failure, and send an interactive request
            // eslint-disable-next-line no-undef
            if (error) {
              console.log(error);
              loginResponse = await this._myMsal.acquireTokenPopup(
                accessTokenRequest
              );
            }
          }
        } else {
          loginResponse = await this._myMsal.acquireTokenPopup(
            accessTokenRequest
          );
        }

        if (this.getModel()) {
          // Destroy all previously loaded data
          // this.getModel().destroy();
        }

        this.setSession(loginResponse);
        this.fireEvent("login", loginResponse);

        if (previousPage) {
          const ODataModel2 =
            previousPage.getModel().getMetadata().getName() ===
            "sap.ui.model.odata.v2.ODataModel"
              ? previousPage.getModel()
              : previousPage.getModel().getODataModel(); // => For BackendJSONModel;

          ODataModel2.setHeaders({
            Authorization: `Bearer ${loginResponse.accessToken}`,
          });
        }

        if (previousTarget) {
          // previousTarget.
          this.getRouter().getTargets().display(previousTarget);
        }
        return loginResponse;
      },

      async logout() {
        const navContainer = this.byId("app");
        const router = this.getRouter();
        const hash = router.getHashChanger().getHash();
        const route = router.getRouteByHash(hash);

        this._previousPage = navContainer.getCurrentPage();
        this._previousTarget = route._oConfig.target;

        const account = this._myMsal.getAllAccounts()[0];
        const logoutRequest = { account };

        await this._myMsal.logoutPopup(logoutRequest);

        this.setSession({});
        this.fireLogout();

        setTimeout(() =>
          this.getRouter().getTargets().display("notAuthenticated")
        );
      },

      async getSession() {
        this.getModel("session").getData();
      },

      setSession(data) {
        this.getModel("session").setData(data);
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
