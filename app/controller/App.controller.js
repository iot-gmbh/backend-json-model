sap.ui.define(
  [
    // "../Authentication",
    "./BaseController",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "iot/BackendJSONModel",
    "errorhandler/ErrorHandler",
  ],
  (BaseController, History, JSONModel, BackendJSONModel, ErrorHandler) =>
    BaseController.extend("iot.planner.controller.App", {
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

      async onInit() {
        this.setModel(new JSONModel({}), "session");

        this.init();

        // this.byId("app").to(this.byId("notAuthenticatedPage"));
      },

      onAfterRendering() {
        this._currentPage = this.byId("app").getCurrentPage();
      },

      async init() {
        if (!this._myMsal) {
          this._myMsal = new msal.PublicClientApplication(
            this.config.msalConfig
          );
        }

        const account = this._myMsal.getAllAccounts()[0];
        if (account) {
          this.getOwnerComponent().awaitLogin = this.login(account);
        } else {
          this.byId("app").to(this.byId("notAuthenticatedPage"));
        }
      },

      async login(account) {
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
          this.getModel().destroy();
        }

        this.setSession(loginResponse);

        const backendJSONModel = new BackendJSONModel("/v2/timetracking/", {
          headers: {
            Authorization: `Bearer ${loginResponse.accessToken}`,
          },
          useBatch: false,
        });

        const ODataModel = backendJSONModel.getODataModel();

        // call the base component's init function
        this.setModel(backendJSONModel);
        this.setModel(ODataModel, "OData");

        ErrorHandler.cover([ODataModel]);

        this.getOwnerComponent().fireEvent("login", loginResponse);

        if (this._currentPage) {
          this.byId("app").to(this._currentPage);
        }

        return loginResponse;
      },

      async logout() {
        const account = this._myMsal.getAllAccounts()[0];
        const logoutRequest = { account };

        await this._myMsal.logoutPopup(logoutRequest);

        this.setSession({});
        this.getModel().destroy();
        this.getOwnerComponent().fireLogout();

        const navContainer = this.byId("app");
        this._currentPage = navContainer.getCurrentPage();

        this.byId("app").to(this.byId("notAuthenticatedPage"));
      },

      async getSession() {
        this.getView().getModel("session").getData();
      },

      setSession(data) {
        this.getView().getModel("session").setData(data);
      },

      onPressNavBack() {
        const sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().to("home", {}, true);
        }
      },

      onPressRefreshPage() {
        window.location.reload();
      },
    })
);
