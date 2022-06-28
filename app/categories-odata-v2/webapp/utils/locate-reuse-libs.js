/* eslint-disable semi, no-console */
(function (sap) {
  fioriToolsGetManifestLibs = function (manifestPath) {
    const url = manifestPath;
    let result = "";
    // SAPUI5 delivered namespaces from https://ui5.sap.com/#/api/sap
    const ui5Libs = [
      "sap.apf",
      "sap.base",
      "sap.chart",
      "sap.collaboration",
      "sap.f",
      "sap.fe",
      "sap.fileviewer",
      "sap.gantt",
      "sap.landvisz",
      "sap.m",
      "sap.ndc",
      "sap.ovp",
      "sap.rules",
      "sap.suite",
      "sap.tnt",
      "sap.ui",
      "sap.uiext",
      "sap.ushell",
      "sap.uxap",
      "sap.viz",
      "sap.webanalytics",
      "sap.zen",
    ];
    return new Promise((resolve, reject) => {
      $.ajax(url)
        .done((manifest) => {
          if (manifest) {
            if (
              manifest["sap.ui5"]
              && manifest["sap.ui5"].dependencies
              && manifest["sap.ui5"].dependencies.libs
            ) {
              Object.keys(manifest["sap.ui5"].dependencies.libs).forEach(
                (manifestLibKey) => {
                  // ignore libs that start with SAPUI5 delivered namespaces
                  if (
                    !ui5Libs.some((substring) => (
                      manifestLibKey === substring
                        || manifestLibKey.startsWith(`${substring}.`)
                    ))
                  ) {
                    if (result.length > 0) {
                      result = `${result},${manifestLibKey}`;
                    } else {
                      result = manifestLibKey;
                    }
                  }
                },
              );
            }
          }
          resolve(result);
        })
        .fail((error) => {
          reject(new Error(`Could not fetch manifest at '${manifestPath}`));
        });
    });
  };
  /**
   * Registers the module paths for dependencies of the given component.
   * @param {string} manifestPath The the path to the app manifest path
   * for which the dependencies should be registered.
   * @returns {Promise} A promise which is resolved when the ajax request for
   * the app-index was successful and the module paths were registered.
   */
  sap.registerComponentDependencyPaths = function (manifestPath) {
    return fioriToolsGetManifestLibs(manifestPath).then((libs) => {
      if (libs && libs.length > 0) {
        let url = `/sap/bc/ui2/app_index/ui5_app_info?id=${libs}`;
        const sapClient = jQuery.sap.getUriParameters().get("sap-client");
        if (sapClient && sapClient.length === 3) {
          url = `${url}&sap-client=${sapClient}`;
        }
        return $.ajax(url).done((data) => {
          if (data) {
            Object.keys(data).forEach((moduleDefinitionKey) => {
              const moduleDefinition = data[moduleDefinitionKey];
              if (moduleDefinition && moduleDefinition.dependencies) {
                moduleDefinition.dependencies.forEach((dependency) => {
                  if (
                    dependency.url
                    && dependency.url.length > 0
                    && dependency.type === "UI5LIB"
                  ) {
                    jQuery.sap.log.info(
                      `Registering Library ${
                        dependency.componentId
                      } from server ${
                        dependency.url}`,
                    );
                    jQuery.sap.registerModulePath(
                      dependency.componentId,
                      dependency.url,
                    );
                  }
                });
              }
            });
          }
        });
      }
    });
  };
}(sap));

const scripts = document.getElementsByTagName("script");
const currentScript = scripts[scripts.length - 1];
const manifestUri = currentScript.getAttribute("data-sap-ui-manifest-uri");
const componentName = currentScript.getAttribute("data-sap-ui-componentName");
const useMockserver = currentScript.getAttribute("data-sap-ui-use-mockserver");
sap
  .registerComponentDependencyPaths(manifestUri)
  .catch((error) => {
    jQuery.sap.log.error(error);
  })
  .finally(() => {
    // setting the app title with internationalization
    sap.ui.getCore().attachInit(() => {
      jQuery.sap.require("jquery.sap.resources");
      const sLocale = sap.ui.getCore().getConfiguration().getLanguage();
      const oBundle = jQuery.sap.resources({
        url: "i18n/i18n.properties",
        locale: sLocale,
      });
      document.title = oBundle.getText("appTitle");
    });

    if (componentName && componentName.length > 0) {
      if (useMockserver && useMockserver === "true") {
        sap.ui.getCore().attachInit(() => {
          sap.ui.require(
            [`${componentName.replace(/\./g, "/")}/localService/mockserver`],
            (server) => {
              // set up test service for local testing
              server.init();
              // initialize the ushell sandbox component
              sap.ushell.Container.createRenderer().placeAt("content");
            },
          );
        });
      } else {
        // Requiring the ComponentSupport module automatically executes the component initialisation for all declaratively defined components
        sap.ui.require(["sap/ui/core/ComponentSupport"]);

        // setting the app title with the i18n text
        sap.ui.getCore().attachInit(() => {
          jQuery.sap.require("jquery.sap.resources");
          const sLocale = sap.ui.getCore().getConfiguration().getLanguage();
          const oBundle = jQuery.sap.resources({
            url: "i18n/i18n.properties",
            locale: sLocale,
          });
          document.title = oBundle.getText("appTitle");
        });
      }
    } else {
      sap.ui.getCore().attachInit(() => {
        // initialize the ushell sandbox component
        sap.ushell.Container.createRenderer().placeAt("content");
      });
    }
  });

sap.registerComponentDependencyPaths(manifestUri);
