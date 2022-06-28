sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  (e, t) => e.extend("iot.singleplanningcalendar.controller.BaseController", {
    getRouter() {
      return this.getOwnerComponent().getRouter();
    },
    getModel(e) {
      return this.getView().getModel(e);
    },
    setModel(e, t) {
      return this.getView().setModel(e, t);
    },
    getResourceBundle() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },
    async read({ path: e, ...t }) {
      return new Promise((r, n) => {
        this.getModel("OData").read(e, { ...t, success: r, error: n });
      });
    },
    async update({ path: e, data: t }) {
      return new Promise((r, n) => {
        this.getModel("OData").update(e, t, { success: r, error: n });
      });
    },
    async create({ path: e, data: t }) {
      return new Promise((r, n) => {
        this.getModel("OData").create(e, t, { success: r, error: n });
      });
    },
    async reset({ path: e, data: t }) {
      return new Promise((r, n) => {
        this.getModel("OData").update(
          e,
          { ...t, resetEntry: true },
          { success: r, error: n },
        );
      });
    },
    async remove({
      path: e,
      data: { ID: t, activatedDate: r, completedDate: n },
    }) {
      return new Promise((a, s) => {
        this.getModel("OData").update(
          e,
          {
            ID: t, activatedDate: r, completedDate: n, deleted: true,
          },
          { success: a, error: s },
        );
      });
    },
    onNavBack() {
      const e = t.getInstance().getPreviousHash();
      if (e !== undefined) {
        history.go(-1);
      } else {
        this.getRouter().navTo("master", {}, true);
      }
    },
  }),
);
