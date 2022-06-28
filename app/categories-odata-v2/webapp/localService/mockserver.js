sap.ui.define(["sap/ui/core/util/MockServer"], (MockServer) => {
  let oMockServer;
  const _sAppModulePath = "iot/planner/categoriesodatav2/";
  const _sJsonFilesModulePath = `${_sAppModulePath}localService/mockdata`;

  return {
    /**
     * Initializes the mock server.
     * You can configure the delay with the URL parameter "serverDelay".
     * The local mock data in this folder is returned instead of the real data for testing.
     * @public
     */

    init() {
      const oUriParameters = jQuery.sap.getUriParameters();
      const sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath);
      const sManifestUrl = jQuery.sap.getModulePath(
        `${_sAppModulePath}manifest`,
        ".json",
      );
      const sEntity = "Categories";
      const sErrorParam = oUriParameters.get("errorType");
      const iErrorCode = sErrorParam === "badRequest" ? 400 : 500;
      const oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data;
      const oDataSource = oManifest["sap.app"].dataSources;
      const oMainDataSource = oDataSource.mainService;
      const sMetadataUrl = jQuery.sap.getModulePath(
        _sAppModulePath
            + oMainDataSource.settings.localUri.replace(".xml", ""),
        ".xml",
      );
        // ensure there is a trailing slash
      const sMockServerUrl = /.*\/$/.test(oMainDataSource.uri)
        ? oMainDataSource.uri
        : `${oMainDataSource.uri}/`;
      const aAnnotations = oMainDataSource.settings.annotations;

      oMockServer = new MockServer({
        rootUri: sMockServerUrl,
      });

      // configure mock server with a delay of 1s
      MockServer.config({
        autoRespond: true,
        autoRespondAfter: oUriParameters.get("serverDelay") || 1000,
      });

      // load local mock data
      oMockServer.simulate(sMetadataUrl, {
        sMockdataBaseUrl: sJsonFilesUrl,
        bGenerateMissingMockData: true,
      });

      const aRequests = oMockServer.getRequests();
      const fnResponse = function (iErrCode, sMessage, aRequest) {
        aRequest.response = function (oXhr) {
          oXhr.respond(
            iErrCode,
            {
              "Content-Type": "text/plain;charset=utf-8",
            },
            sMessage,
          );
        };
      };

      // handling the metadata error test
      if (oUriParameters.get("metadataError")) {
        aRequests.forEach((aEntry) => {
          if (aEntry.path.toString().indexOf("$metadata") > -1) {
            fnResponse(500, "metadata Error", aEntry);
          }
        });
      }

      // Handling request errors
      if (sErrorParam) {
        aRequests.forEach((aEntry) => {
          if (aEntry.path.toString().indexOf(sEntity) > -1) {
            fnResponse(iErrorCode, sErrorParam, aEntry);
          }
        });
      }
      oMockServer.start();

      jQuery.sap.log.info("Running the app with mock data");

      if (aAnnotations && aAnnotations.length > 0) {
        aAnnotations.forEach((sAnnotationName) => {
          const oAnnotation = oDataSource[sAnnotationName];
          const sUri = oAnnotation.uri;
          const sLocalUri = jQuery.sap.getModulePath(
            _sAppModulePath
                + oAnnotation.settings.localUri.replace(".xml", ""),
            ".xml",
          );

          // backend annotations
          new MockServer({
            rootUri: sUri,
            requests: [
              {
                method: "GET",
                path: new RegExp("([?#].*)?"),
                response(oXhr) {
                  jQuery.sap.require("jquery.sap.xml");

                  const oAnnotations = jQuery.sap.sjax({
                    url: sLocalUri,
                    dataType: "xml",
                  }).data;

                  oXhr.respondXML(
                    200,
                    {},
                    jQuery.sap.serializeXML(oAnnotations),
                  );
                  return true;
                },
              },
            ],
          }).start();
        });
      }
    },

    /**
     * @public returns the mockserver of the app, should be used in integration tests
     * @returns {sap.ui.core.util.MockServer}
     */
    getMockServer() {
      return oMockServer;
    },
  };
});
