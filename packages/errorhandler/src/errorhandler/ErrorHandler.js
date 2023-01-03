sap.ui.define(
  [
    "./ErrorParser",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
    "sap/ui/model/resource/ResourceModel",
  ],
  (ErrorParser, Message, MessageBox) => ({
    cover(ODataModels) {
      const msgManager = this.getMessageManager();

      this.resBundle = sap.ui
        .getCore()
        .getLibraryResourceBundle("errorhandler");

      this.ErrorParser = new ErrorParser(this);
      this.msgProcessor = new sap.ui.core.message.ControlMessageProcessor();

      msgManager.registerMessageProcessor(this.msgProcessor);
      msgManager.removeAllMessages();

      return this.registerODataModels(ODataModels);
    },

    registerODataModels(models) {
      models.forEach((model) =>
        model.attachRequestFailed((event) => this.handleRequestFailed(event))
      );
      return Promise.all(
        models.map(
          (model) =>
            new Promise((resolve, reject) => {
              if (model.isMetadataLoadingFailed()) {
                reject();
              }

              model.attachMetadataFailed(() => reject());
              model.metadataLoaded().then(() => resolve());
            })
        )
      ).catch(() => {
        throw new Error(this.resBundle.getText("metadataLoadingFailed"));
      });
    },

    handleRequestFailed(event) {
      const response = event.getParameter("response");
      const { statusCode = 400, responseText = "" } = response;

      // => Explicitly use == because we don't know the format of the statusCode
      // eslint-disable-next-line eqeqeq
      if (responseText.includes("Timed Out") || statusCode == 504) {
        return this.showError(new Error(this.resBundle.getText("timedOut")));
      }

      if (statusCode == 401) {
        return this.showError(
          "Unauthorized. Please reload the page and login again."
        );
      }

      // An entity that was not found in the service is also throwing a 404 error in OData.
      // We already cover this case with a notFound target so we skip it here.
      // A request that cannot be sent to the server is a technical error that we have to handle though
      if (
        statusCode != 404 ||
        (statusCode == 404 && responseText.indexOf("Cannot POST") === 0)
      ) {
        return this.showError(responseText);
      }

      return "";
    },

    getMessageModel() {
      return this.getMessageManager().getMessageModel();
    },

    /** =================================================
     *                       private
     *  ================================================= */

    getMessageManager() {
      return sap.ui.getCore().getMessageManager();
    },

    showError(error) {
      const ui5Message = this.getUI5MessageFrom(error);
      const msgText = ui5Message.getMessage();

      if (
        !this.getMessageModel()
          .getData()
          .some((msg) => msgText === msg.getMessage())
      ) {
        this.getMessageManager().addMessages(ui5Message);
      }

      if (this._messageBoxIsOpen) return;

      this._messageBoxIsOpen = true;

      MessageBox.error(msgText, {
        id: "serviceErrorMessageBox",
        closeOnNavigation: false,
        actions: [MessageBox.Action.CLOSE],
        onClose: () => {
          this._messageBoxIsOpen = false;
        },
      });
    },

    getUI5MessageFrom(error) {
      if (
        typeof error === "object" &&
        error.getMetadata &&
        error.getMetadata().getName &&
        error.getMetadata().getName() === "sap.ui.core.message.Message"
      ) {
        return error;
      }

      return new Message({
        message: this.ErrorParser.extractErrorTextFrom(error),
        type: sap.ui.core.MessageType.Error,
      });
    },
  })
);
