sap.ui.define(
  ["sap/ui/model/odata/v2/ODataModel", "sap/ui/model/json/JSONModel"],
  (ODataModel, JSONModel) => {
    function _promisify(model, method, paramsIndex, ...args) {
      return new Promise((resolve, reject) => {
        const params = args[paramsIndex] || {};
        const newArgs = [...args];

        newArgs[paramsIndex] = {
          ...params,
          success: resolve,
          error: reject,
        };

        model[method](model, ...newArgs);
      });
    }

    const reduce = (nestedArray) =>
      nestedArray.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.ID]: { ...curr, children: reduce(curr.children) },
        }),
        {}
      );

    return JSONModel.extend("iot.ODataModelV2", {
      init(serviceURL, ...args) {
        JSONModel.prototype.init.call(this, ...args);

        const odataModel = new ODataModel(serviceURL);

        this.odata = {
          create: _promisify(odataModel, "create", 2),
          read: _promisify(odataModel, "read", 1),
          update: _promisify(odataModel, "update", 2),
          remove: _promisify(odataModel, "update", 1),
          callFunction: _promisify(odataModel, "callFunction", 1),
        };
      },

      async create(...args) {
        const result = await this.odata.create(...args);
        const [path] = args;

        const data = this.getProperty(path);
        data.push(result.data);
        this.setProperty(path, data);
      },

      async read(...args) {
        const result = await this.odata.read(...args);
        const [path] = args;

        this.setProperty(path, result.data);
      },

      async update(...args) {
        const result = await this.odata.update(...args);
        const [path, data] = args;

        const entityPath = path.split("(")[0];

        // const data = this.getProperty(entityPath);
        data.push(result.data);
        this.setProperty(path, data);

        this.setProperty(path, result.data);
      },
    });
  }
);
