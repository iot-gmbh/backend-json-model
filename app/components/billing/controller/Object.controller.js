sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
  ],
  (BaseController, JSONModel, History, formatter) =>
    BaseController.extend("iot.planner.billing.controller.Object", {
      formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the worklist controller is instantiated.
       * @public
       */
      onInit() {
        // Model used to manipulate control states. The chosen values make sure,
        // detail page shows busy indication immediately so there is no break in
        // between the busy indication for loading the view's meta data
        const oViewModel = new JSONModel({
          busy: true,
          delay: 0,
        });
        this.getRouter()
          .getRoute("object")
          .attachPatternMatched(this._onObjectMatched, this);
        this.setModel(oViewModel, "objectView");
      },
      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Event handler  for navigating back.
       * It there is a history entry we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the worklist route.
       * @public
       */
      onNavBack() {
        const sPreviousHash = History.getInstance().getPreviousHash();
        if (sPreviousHash !== undefined) {
          History.go(-1);
        } else {
          this.getRouter().navTo("worklist", {}, true);
        }
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      /**
       * Binds the view to the object path.
       * @function
       * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
       * @private
       */
      _onObjectMatched(oEvent) {
        const sObjectId = oEvent.getParameter("arguments").objectId;
        this._bindView(`/MyWorkItems${sObjectId}`);
      },

      /**
       * Binds the view to the object path.
       * @function
       * @param {string} sObjectPath path to the object to be bound
       * @private
       */
      _bindView(sObjectPath) {
        const oViewModel = this.getModel("objectView");

        this.getView().bindElement({
          path: sObjectPath,
          events: {
            change: this._onBindingChange.bind(this),
            dataRequested() {
              oViewModel.setProperty("/busy", true);
            },
            dataReceived() {
              oViewModel.setProperty("/busy", false);
            },
          },
        });
      },

      _onBindingChange() {
        const oView = this.getView();
        const oViewModel = this.getModel("objectView");
        const oElementBinding = oView.getElementBinding();

        // No data for the binding
        if (!oElementBinding.getBoundContext()) {
          this.getRouter().getTargets().display("objectNotFound");
          return;
        }

        const oResourceBundle = this.getResourceBundle();
        const oObject = oView.getBindingContext().getObject();
        const sObjectId = oObject.ID;
        const sObjectName = oObject.MyWorkItems;

        oViewModel.setProperty("/busy", false);
        oViewModel.setProperty(
          "/shareSendEmailSubject",
          oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId])
        );
        oViewModel.setProperty(
          "/shareSendEmailMessage",
          oResourceBundle.getText("shareSendEmailObjectMessage", [
            sObjectName,
            sObjectId,
            location.href,
          ])
        );
      },
    })
);
