/* eslint-disable camelcase */

sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    // "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/Sorter",
    "sap/m/Token",
  ],
  (
    BaseController,
    JSONModel,
    // formatter,
    Filter,
    FilterOperator,
    FilterType,
    Sorter,
    Token
  ) => {
    const nest = (items, ID = null, link = "parent_ID") =>
      items
        .filter((item) => item[link] === ID)
        .map((item) => ({ ...item, children: nest(items, item.ID) }));

    return BaseController.extend(
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
            busy: true,
          });

          this.setModel(viewModel, "worklistView");
        },

        async onBeforeRendering() {
          const model = this.getModel();

          this.getModel("worklistView").setProperty("/busy", true);
          // const categories = await this.getModel().load("/Categories", {
          //   sorters: [new Sorter("title")],
          //   // filters: [new Filter("hierarchyLevel", "EQ", "0")],
          // });
          const { results: categories } = await model.callFunction(
            `/getCategoriesByID`,
            {
              urlParameters: {
                root: null,
              },
            }
          );
          const categoriesNested = nest(categories);

          model.setProperty("/Categories", categoriesNested);

          this.getModel("worklistView").setProperty("/busy", false);
        },

        async onToggleOpenState(event) {
          const model = this.getModel();
          const { rowContext, expanded } = event.getParameters();
          if (!expanded) return;

          const ID = rowContext.getProperty("ID");
          const { results: categories } = await model.callFunction(
            `/getCategoriesByID`,
            {
              urlParameters: {
                root: ID,
              },
            }
          );

          const categoriesNested = nest(categories);

          model.setProperty("/Categories", categoriesNested);
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
          const dialog = this.byId("editCategoryDialog");

          const rowAction = event.getSource().getParent();
          const {
            ID: parent_ID,
            hierarchyLevel,
            children,
          } = rowAction.getBindingContext().getObject();

          const localPath = `${rowAction
            .getBindingContext()
            .getPath()}/children/${children.length}`;

          this.getModel().setProperty("/newCategory", {
            parent_ID,
            hierarchyLevel: (parseInt(hierarchyLevel, 10) + 1).toString(),
            localPath,
            validFrom: new Date(),
            validTo: new Date(2024, 10, 30),
          });

          viewModel.setProperty(
            "/popoverTitle",
            this.getResourceBundle().getText("popoverTitle.createCategory")
          );

          dialog.bindElement("/newCategory");
          dialog.open(rowAction);
        },

        async onPressUpdateCategory(event) {
          const model = this.getModel();
          const rowAction = event.getSource().getParent();
          const dialog = this.byId("editCategoryDialog");
          const path = rowAction.getBindingContext().getPath();
          const category = rowAction.getBindingContext().getObject();
          const ODataPath = model.getODataPathFrom(category);

          await model.load(`${ODataPath}/members`, {
            into: `${path}/members`,
            sorters: [new Sorter("user_userPrincipalName")],
          });

          this.getModel("worklistView").setProperty(
            "/popoverTitle",
            this.getResourceBundle().getText("popoverTitle.editCategory")
          );

          model.setProperty(`${path}/localPath`, path);

          dialog.bindElement(path);
          dialog.open(rowAction);
        },

        async onChangeCategory(event) {
          const category = event.getSource().getBindingContext().getObject();
          await this.getModel().update(category);
        },

        async onPressSubmitCategory(event) {
          const model = this.getModel();
          const dialog = event.getSource();
          const category = dialog.getBindingContext().getObject();

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
          const dialog = this.byId("editCategoryDialog");
          this.getModel().setProperty("/newCategory", {});
          dialog.close();
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

        onUpdateUsers2Categories(event) {
          const model = this.getModel();
          const { addedTokens = [], removedTokens = [] } =
            event.getParameters();

          this._removeDuplicateTokens(event.getSource());

          addedTokens.forEach((token) => {
            const user_userPrincipalName = token.getKey();
            const category_ID = token.getBindingContext().getProperty("ID");
            const localPath = `${token
              .getBindingContext()
              .getPath()}/members/X`;

            model.create("/Users2Categories", {
              category_ID,
              user_userPrincipalName,
              localPath,
            });
          });

          removedTokens.forEach((token) => {
            const obj = token.getBindingContext().getObject();

            model.remove(obj);
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

        onDeleteToken(event) {
          const obj = event.getSource().getBindingContext().getObject();

          this.getModel().remove(obj);
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
            const obj = token.getBindingContext().getPath();

            model.remove(obj);
          });
        },
      }
    );
  }
);
