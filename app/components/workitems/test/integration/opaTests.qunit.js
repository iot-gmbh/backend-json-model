/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(() => {
	sap.ui.require(['sap/ui/demo/todo/test/integration/AllJourneys'], () => {
		QUnit.start();
	});
});
