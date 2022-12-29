sap.ui.define([], () => {
  sap.ui.getCore().initLibrary({
    name: "errorhandler",
    version: "1.0.0",
    dependencies: ["sap.ui.core"],
    noLibraryCSS: true,
    types: [],
    interfaces: [],
    controls: ["errorhandler.MessagePopoverButton"],
    elements: [],
  });

  /* eslint-disable */
  return errorhandler;
});
