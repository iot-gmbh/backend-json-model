sap.ui.define(["sap/ui/model/json/JSONModel"], (JSONModel) => ({
  config: {
    msalConfig: {
      auth: {
        clientId: "f2ed7ade-4997-4d3c-8397-a595e2bccf14",
        authority: "https://login.microsoftonline.com/common",
        validateAuthority: false,
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
      },
    },
    scopes: ["User.Read", "Calendars.Read"],
  },

  getSession() {
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
    const loginResponse = await this.login();
    this.setSession(loginResponse);

    return loginResponse;
  },

  async login() {
    const account = this._myMsal.getAllAccounts()[0];
    const accessTokenRequest = {
      scopes: this.config.scopes,
      account,
    };

    try {
      return await this._myMsal.acquireTokenSilent(accessTokenRequest);
    } catch (error) {
      // Acquire token silent failure, and send an interactive request
      // eslint-disable-next-line no-undef
      // if (error instanceof InteractionRequiredAuthError) {
      return this._myMsal.acquireTokenPopup(accessTokenRequest);
      // }
      // throw Error(error);
    }
  },

  async logout() {
    const account = this._myMsal.getAllAccounts()[0];
    const logoutRequest = { account };

    await this._myMsal.logoutPopup(logoutRequest);

    this.setSession();
  },
}));
