sap.ui.define(["sap/ui/model/odata/v2/ODataModel"], (ODataModel) => {
  function _promisify(model, method, paramsIndex, ...args) {
    // return function () {
    // const args = [].slice.call(arguments);

    return new Promise((resolve, reject) => {
      const params = args[paramsIndex] || {};
      const newArgs = [...args];

      newArgs[paramsIndex] = {
        ...params,
        success(data, response) {
          resolve({
            data,
            response,
          });
        },
        error(error) {
          reject(new Error(error.message));
        },
      };

      model[method](model, ...newArgs);
    });
    // };
  }

  return ODataModel.extend("iot.ODataModelV2", {
    init(...args) {
      ODataModel.prototype.init.call(this, args);

      this._promisifyODataModel();
    },

    _promisifyODataModel() {
      this.create = _promisify(this, "create", 2);
      this.read = _promisify(this, "read", 1);
      this.update = _promisify(this, "update", 2);
      this.remove = _promisify(this, "update", 1);
      this.callFunction = _promisify(this, "callFunction", 1);
    },
  });
});
