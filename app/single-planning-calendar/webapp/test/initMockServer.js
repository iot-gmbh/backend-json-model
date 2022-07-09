sap.ui.define(
  ["../localService/mockserver", "sap/m/MessageBox"],
  (mockserver, MessageBox) => {
    const aMockservers = [];

    // initialize the mock server
    aMockservers.push(mockserver.init());

    Promise.all(aMockservers)
      .catch((oError) => {
        MessageBox.error(oError.message);
      })
      .finally(() => {
        // initialize the embedded component on the HTML page
        sap.ui.require(["sap/ui/core/ComponentSupport"]);
      });
  }
);
