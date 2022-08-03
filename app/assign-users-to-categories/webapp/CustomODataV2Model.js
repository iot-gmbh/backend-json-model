sap.ui.define(["sap/ui/model/odata/v2/ODataModel"], (ODataModel) => {
  function _promisify(oModel, sMethod, iParametersIndex) {
    // return function () {
    const aArguments = [].slice.call(arguments);
    return new Promise((fnResolve, fnReject) => {
      const mParameters = aArguments[iParametersIndex] || {};

      aArguments[iParametersIndex] = Object.assign(mParameters, {
        success(oData, oResponse) {
          fnResolve({
            data: oData,
            response: oResponse,
          });
        },
        error(oError) {
          fnReject(new Error(oError.message));
        },
      });

      oModel[sMethod].apply(oModel, aArguments);
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
