// This file used only for loading the changes in the preview and not required to be checked in.
// Loads and extends the openui5 FileListBaseConnector

// For UI5 version >= 1.80, the location of the FileListBaseConnector is different
const connectorPath =
  parseFloat(sap.ui.version) >= 1.8
    ? "sap/ui/fl/write/api/connectors/FileListBaseConnector"
    : "sap/ui/fl/initial/api/connectors/FileListBaseConnector";

sap.ui.define(
  ["sap/base/util/merge", connectorPath],
  (merge, FileListBaseConnector) => {
    const aPromises = [];
    const trustedHosts = [/^localhost$/, /^.*.applicationstudio.cloud.sap$/];
    const url = new URL(window.location.toString());
    const isValidHost = trustedHosts.some((host) => host.test(url.hostname));
    return merge({}, FileListBaseConnector, {
      getFileList() {
        return new Promise((resolve, reject) => {
          // If no changes found, maybe because the app was executed without doing a build.
          // Check for changes folder and load the changes, if any.
          if (!isValidHost)
            reject(console.log("cannot load flex changes: invalid host"));
          $.ajax({
            url: `${url.origin}/changes/`,
            type: "GET",
            cache: false,
          })
            .then((sChangesFolderContent) => {
              const regex = /(\/changes\/[^"]*\.change)/g;
              let result = regex.exec(sChangesFolderContent);
              const aChanges = [];
              while (result !== null) {
                aChanges.push(result[1]);
                result = regex.exec(sChangesFolderContent);
              }
              resolve(aChanges);
            })
            .fail((obj) => {
              // No changes folder, then just resolve
              resolve();
            });
        });
      },
    });
  }
);
