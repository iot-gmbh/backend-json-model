module.exports = function (config) {
  config.set({
    frameworks: ["ui5"],
    ui5: {
      type: "application",
      configPath: "uimodule/ui5.yaml",
      paths: {
        webapp: "uimodule/webapp",
      },
    },
    browsers: ["Chrome"],
    browserConsoleLogOptions: {
      level: "error",
    },
  });
};
