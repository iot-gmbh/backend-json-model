/* eslint-disable camelcase */

sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    // "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/m/Token",
  ],
  (
    BaseController,
    JSONModel,
    // formatter,
    Filter,
    FilterOperator,
    FilterType,
    Token
  ) =>
    BaseController.extend(
      "iot.planner.assignuserstocategories.controller.Worklist",
      {
        // formatter,

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
            newCategory: {},
          });

          this.setModel(viewModel, "worklistView");
        },

        async onBeforeRendering() {
          const model = this.getModel();

          const categories = await this.getModel().load("/Categories", {
            urlParameters: { $expand: "members,tags" },
          });

          const categoriesLevel0 = categories.filter(
            ({ parent_ID }) => !parent_ID
          );

          model.setProperty("/categoriesLevel0", categoriesLevel0);
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

        onPressAddCategory(event) {
          const viewModel = this.getModel("worklistView");
          const rowAction = event.getSource().getParent();
          const { ID: parent_ID, hierarchyLevel } = rowAction
            .getBindingContext()
            .getObject();
          const popover = this.byId("editCategoryPopover");

          this.getModel().setProperty("/newCategory", {
            parent_ID,
            hierarchyLevel: parseInt(hierarchyLevel, 10) + 1,
          });
          viewModel.setProperty(
            "/popoverTitle",
            this.getResourceBundle().getText("popoverTitle.createCategory")
          );

          popover.bindElement("/newCategory");
          popover.openBy(rowAction);
        },

        onPressUpdateCategory(event) {
          const rowAction = event.getSource().getParent();
          const popover = this.byId("editCategoryPopover");

          this.getModel("worklistView").setProperty(
            "/popoverTitle",
            this.getResourceBundle().getText("popoverTitle.editCategory")
          );

          popover.bindElement(rowAction.getBindingContext().getPath());
          popover.openBy(rowAction);
        },

        async onChangeCategory(event) {
          const category = event.getSource().getBindingContext().getObject();
          await this.getModel().update(category);
        },

        async onPressSubmitCategory(event) {
          const model = this.getModel();
          const popover = event.getSource();
          const category = popover.getBindingContext().getObject();

          this._closePopover();

          if (category.ID) {
            // Update
            await model.update(category);
          } else {
            // Create
            await model.create("/Categories", category);
          }
        },

        onPressClosePopover() {
          this._closePopover();
        },

        _closePopover() {
          const popover = this.byId("editCategoryPopover");
          this.getModel().setProperty("/newCategory", {});
          popover.close();
        },

        onPressDeleteCategory(event) {
          const obj = event.getSource().getBindingContext().getObject();

          this.getModel().remove(obj);
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

        onSearch(event) {
          const { query } = event.getParameters();

          const filters = [
            new Filter({
              path: "title",
              operator: "Contains",
              value1: query,
            }),
          ];

          this.byId("treeTable")
            .getBinding("rows")
            .filter(filters, FilterType.Application);
        },

        onCreateToken(event) {
          const multiInput = event.getSource();
          const { value } = event.getParameters();
          const newToken = new Token({ text: value });

          multiInput.addToken(newToken);
          multiInput.setValue();
          multiInput.fireTokenUpdate({ addedTokens: [newToken] });
        },

        onUpdateTags(event) {
          const model = this.getModel();
          const { addedTokens = [], removedTokens = [] } =
            event.getParameters();

          this._removeDuplicateTokens(event.getSource());

          addedTokens.forEach((token) => {
            // const ID = token.getKey();
            const title = token.getText();
            // Suspicious: For added tokens, token.getBindingContext() gives the category - for removed tokens, it gives the token itself
            const category_ID = token.getBindingContext().getProperty("ID");

            model.create("/Tags", {
              title,
            });

            model.create("/Tags2Categories", {
              tag_title: title,
              category_ID,
            });
          });

          removedTokens.forEach((token) => {
            const path = token.getBindingContext().getPath();

            model.remove(path);
          });
        },

        _removeDuplicateTokens(multiInput) {
          const tokens = multiInput.getTokens();
          const tokensMap = {};

          tokens.forEach((token) => {
            const title = token.getText();
            tokensMap[title] = token;
          });

          multiInput.setTokens(Object.values(tokensMap));
        },

        onUpdateUsers2Categories(event) {
          const model = this.getModel();
          const { addedTokens = [], removedTokens = [] } =
            event.getParameters();

          this._removeDuplicateTokens(event.getSource());

          addedTokens.forEach((token) => {
            const user_userPrincipalName = token.getKey();
            const category_ID = token.getBindingContext().getProperty("ID");

            model.create("/Users2Categories", {
              category_ID,
              user_userPrincipalName,
            });
          });

          removedTokens.forEach((token) => {
            const path = token.getBindingContext().getPath();

            model.remove(path);
          });
        },

        onDeleteToken(event) {
          const path = event.getSource().getBindingContext().getPath();

          this.getModel().remove(path);
        },
      }
    )
);
