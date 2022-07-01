/* eslint-disable camelcase */
sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (BaseController, JSONModel, formatter, Filter, FilterOperator) =>
    BaseController.extend(
      "iot.planner.assignuserstocategories.controller.Worklist",
      {
        formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit() {
          // keeps the search state
          this._aTableSearchState = [];

          // Model used to manipulate control states
          const viewModel = new JSONModel({
            worklistTableTitle:
              this.getResourceBundle().getText("worklistTableTitle"),
            tableNoDataText:
              this.getResourceBundle().getText("tableNoDataText"),
          });
          this.setModel(viewModel, "worklistView");
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished(oEvent) {
          // update the worklist's object counter after the table update
          let sTitle;
          const oTable = oEvent.getSource();
          const iTotalItems = oEvent.getParameter("total");
          // only update the counter if the length is final and
          // the table is not empty
          if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
            sTitle = this.getResourceBundle().getText(
              "worklistTableTitleCount",
              [iTotalItems]
            );
          } else {
            sTitle = this.getResourceBundle().getText("worklistTableTitle");
          }
          this.getModel("worklistView").setProperty(
            "/worklistTableTitle",
            sTitle
          );
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress(oEvent) {
          // The source is the list item that got pressed
          this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack() {
          // eslint-disable-next-line no-restricted-globals
          history.go(-1);
        },

        onSearch(oEvent) {
          if (oEvent.getParameters().refreshButtonPressed) {
            // Search field's 'refresh' button has been pressed.
            // This is visible if you select any main list item.
            // In this case no new search is triggered, we only
            // refresh the list binding.
            this.onRefresh();
          } else {
            let aTableSearchState = [];
            const sQuery = oEvent.getParameter("query");

            if (sQuery && sQuery.length > 0) {
              aTableSearchState = [
                new Filter("title", FilterOperator.Contains, sQuery),
              ];
            }
            this._applySearch(aTableSearchState);
          }
        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh() {
          const oTable = this.byId("table");
          oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject(oItem) {
          this.getRouter().navTo("object", {
            objectId: oItem
              .getBindingContext()
              .getPath()
              .substring("/Categories".length),
          });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch(aTableSearchState) {
          const oTable = this.byId("table");
          const oViewModel = this.getModel("worklistView");
          oTable.getBinding("items").filter(aTableSearchState, "Application");
          // changes the noDataText of the list in case there are no filter results
          if (aTableSearchState.length !== 0) {
            oViewModel.setProperty(
              "/tableNoDataText",
              this.getResourceBundle().getText("worklistNoDataWithSearchText")
            );
          }
        },

        onTokenUpdate(event) {
          const model = this.getModel();
          const { addedTokens } = event.getParameters();

          addedTokens.forEach((token) => {
            const user_userPrincipalName = token.getKey();
            const category_ID = token.getBindingContext().getProperty("ID");

            model.createEntry("/Users2Categories", {
              properties: {
                category_ID,
                user_userPrincipalName,
              },
            });
          });

          model.submitChanges();
        },

        onDeleteToken(event) {
          const path = event.getSource().getBindingContext().getPath();

          this.getModel().remove(path);
        },
      }
    )
);
