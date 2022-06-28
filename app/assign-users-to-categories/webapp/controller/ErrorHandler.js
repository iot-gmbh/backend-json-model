/* eslint-disable object-shorthand */
sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (UI5Object, MessageBox, Filter, FilterOperator) =>
    UI5Object.extend(
      "iot.planner.assignuserstocategories.controller.ErrorHandler",
      {
        /**
         * Handles application errors by automatically attaching to the model events and displaying errors when needed.
         * @class
         * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
         * @public
         * @alias iot.planner.assignuserstocategories.controller.ErrorHandler
         */
        // eslint-disable-next-line object-shorthand
        // eslint-disable-next-line func-names
        constructor: function (oComponent) {
          const oMessageManager = sap.ui.getCore().getMessageManager();
          const oMessageModel = oMessageManager.getMessageModel();
          const oResourceBundle = oComponent
            .getModel("i18n")
            .getResourceBundle();
          const sErrorText = oResourceBundle.getText("errorText");
          const sMultipleErrors = oResourceBundle.getText("multipleErrorsText");

          this._oComponent = oComponent;
          this._bMessageOpen = false;

          this.oMessageModelBinding = oMessageModel.bindList(
            "/",
            undefined,
            [],
            new Filter("technical", FilterOperator.EQ, true)
          );

          this.oMessageModelBinding.attachChange(function (oEvent) {
            const aContexts = oEvent.getSource().getContexts();
            const aMessages = [];

            if (this._bMessageOpen || !aContexts.length) {
              return;
            }

            // Extract and remove the technical messages
            aContexts.forEach((oContext) => {
              aMessages.push(oContext.getObject());
            });
            oMessageManager.removeMessages(aMessages);

            // Due to batching there can be more than one technical message. However the UX
            // guidelines say "display a single message in a message box" assuming that there
            // will be only one at a time.
            const sErrorTitle =
              aMessages.length === 1 ? sErrorText : sMultipleErrors;
            this._showServiceError(sErrorTitle, aMessages[0].message);
          }, this);
        },

        /**
         * Shows a {@link sap.m.MessageBox} when a service call has failed.
         * Only the first error message will be displayed.
         * @param {string} sErrorTitle A title for the error message
         * @param {string} sDetails A technical error to be displayed on request
         * @private
         */
        _showServiceError(sErrorTitle, sDetails) {
          this._bMessageOpen = true;
          MessageBox.error(sErrorTitle, {
            id: "serviceErrorMessageBox",
            details: sDetails,
            styleClass: this._oComponent.getContentDensityClass(),
            actions: [MessageBox.Action.CLOSE],
            onClose: function () {
              this._bMessageOpen = false;
            }.bind(this),
          });
        },
      }
    )
);
