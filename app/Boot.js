sap.ui.define(
  [
    "sap/ui/core/Core",
    "sap/m/library", // avoid library preload of sap.m
    "sap/f/library", // avoid library preload of sap.m
    "sap/ui/core/library", // avoid library preload of sap.ui.core
    "sap/ui/comp/library", // avoid library preload of sap.ui.core
    "sap/ui/table/library", // avoid library preload of sap.ui.core
    "errorhandler/library", // avoid library preload of sap.ui.core
  ],
  (Core) => {
    // preload the library resources bundles async
    // which happens automatically for library preload
    Promise.all([
      Core.getLibraryResourceBundle("sap.f", true),
      Core.getLibraryResourceBundle("sap.m", true),
      Core.getLibraryResourceBundle("sap.ui.core", true),
      Core.getLibraryResourceBundle("sap.ui.comp", true),
      Core.getLibraryResourceBundle("sap.ui.table", true),
      Core.getLibraryResourceBundle("errorhandler", true),
    ]).then(() => {
      // boot the Core:
      //   - loads the Component-bundle defined in data-sap-ui-modules
      //   - using the ComponentSupport in sap-ui-onInit to load the declared component
      Core.boot();
    });
  }
);
