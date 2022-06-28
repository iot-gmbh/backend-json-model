QUnit.config.autostart = false;
sap.ui.getCore().attachInit(() => {
  sap.ui.require([], () => {
    QUnit.start();
  });
});
