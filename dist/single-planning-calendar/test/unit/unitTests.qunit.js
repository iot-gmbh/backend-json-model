QUnit.config.autostart = false;
sap.ui.getCore().attachInit(function () {
  "use strict";
  sap.ui.require(
    ["iot/single-planning-calendar/test/unit/AllTests"],
    function () {
      QUnit.start();
    }
  );
});
