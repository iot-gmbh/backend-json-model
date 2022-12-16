sap.ui.define(["sap/ui/model/json/JSONModel"], (JSONModel) => ({
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

  async getSession() {
    const sessionModel = sap.ui.getCore().getModel("UI5ProjectPlanningSession");
    if (!sessionModel) {
      await this._loginPromise;
    }

    return sap.ui.getCore().getModel("UI5ProjectPlanningSession").getData();
  },

  setSession(data) {
    const model = new JSONModel(data);
    sap.ui.getCore().setModel(model, "UI5ProjectPlanningSession");
  },

  async init() {
    if (!this._myMsal) {
      this._myMsal = new msal.PublicClientApplication(this.config.msalConfig);
    }
    this._loginPromise = this.login();

    const loginResponse = await this._loginPromise;
    this.setSession(loginResponse);

    return loginResponse;
  },

  async login() {
    const account = this._myMsal.getAllAccounts()[0];
    const accessTokenRequest = {
      scopes: this.config.scopes,
      account,
    };

    // try {
    //   return await this._myMsal.acquireTokenSilent(accessTokenRequest);
    // } catch (error) {
    //   // Acquire token silent failure, and send an interactive request
    //   // eslint-disable-next-line no-undef
    //   // if (error instanceof InteractionRequiredAuthError) {
    //     // }
    //     // throw Error(error);
    //   }
    return this._myMsal.acquireTokenPopup(accessTokenRequest);
  },

  async logout() {
    const account = this._myMsal.getAllAccounts()[0];
    const logoutRequest = { account };

    await this._myMsal.logoutPopup(logoutRequest);

    this.setSession();
  },
}));
