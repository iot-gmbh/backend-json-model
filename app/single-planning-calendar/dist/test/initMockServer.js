sap.ui.define(
  ["../localService/mockserver", "sap/m/MessageBox"],
  (e, i) => {
    const r = [];
    r.push(e.init());
    Promise.all(r)
      .catch((e) => {
        i.error(e.message);
      })
      .finally(() => {
        sap.ui.require(["sap/ui/core/ComponentSupport"]);
      });
  },
);
