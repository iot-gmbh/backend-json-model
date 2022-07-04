/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(() => {
	sap.ui.require(['sap/ui/demo/todo/test/unit/AllTests'], () => {
		QUnit.start();
	});
});
