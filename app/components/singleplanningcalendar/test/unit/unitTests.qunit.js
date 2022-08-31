/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(() => {
  sap.ui.require(["iot/single-planning-calendar/test/unit/AllTests"], () => {
    QUnit.start();
  });
});