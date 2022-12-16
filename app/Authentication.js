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
    this.getView().getModel("session").getData();
  },

  setSession(data) {
    this.getView().getModel("session").setData(data);
  },

  async init() {
    if (!this._myMsal) {
      this._myMsal = new msal.PublicClientApplication(this.config.msalConfig);
    }

    return this.login();
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
      if (error instanceof InteractionRequiredAuthError) {
        // throw Error(error);
      }
    }

    const loginResponse = await this._myMsal.acquireTokenPopup(
      accessTokenRequest
    );
    this.setSession(loginResponse);

    return loginResponse;
  },

  async logout() {
    const account = this._myMsal.getAllAccounts()[0];
    const logoutRequest = { account };

    await this._myMsal.logoutPopup(logoutRequest);

    this.setSession({});
  },
}));
