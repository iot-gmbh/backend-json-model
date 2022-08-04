/* eslint-disable no-restricted-globals */

sap.ui.define(
  [
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "./dot-prop",
  ],
  (ODataModel, JSONModel, dotprop) => {
    function _promisify(model, method, paramsIndex) {
      return function (...args) {
        return new Promise((resolve, reject) => {
          const params = args[paramsIndex] || {};
          const newArgs = [...args];

          newArgs[paramsIndex] = {
            ...params,
            success: resolve,
            error: reject,
          };

          model[method](...newArgs);
        });
      };
    }

    const nest = (
      items,
      ID = null,
      nestName = "children",
      link = "parent_ID"
    ) =>
      items
        .filter((item) => item[link] === ID)
        .map((item) => ({ ...item, [nestName]: nest(items, item.ID) }));

    return JSONModel.extend("iot.ODataModelV2", {
      // eslint-disable-next-line object-shorthand, func-names
      constructor: function (serviceURL, ...args) {
        JSONModel.apply(this, ...args);

        const odataModel = new ODataModel(serviceURL);
        this.serviceURL = serviceURL;

        this.shadowModel = new JSONModel();

        this.odata = {
          create: _promisify(odataModel, "create", 2),
          read: _promisify(odataModel, "read", 1),
          query: _promisify(odataModel, "read", 1),
          update: _promisify(odataModel, "update", 2),
          remove: _promisify(odataModel, "remove", 1),
          callFunction: _promisify(odataModel, "callFunction", 1),
        };
      },

      async create(...args) {
        const result = await this.odata.create(...args);
        const [path] = args;

        const data = this.getProperty(path);

        data.push(result);

        this.setProperty(path, data);
        this.shadowModel.setProperty(path, data);
        this.nest(path, data, true);
      },

      async read(...args) {
        const { results } = await this.odata.read(...args);

        return results;
      },

      async load(...args) {
        const { results } = await this.odata.read(...args);
        const [path] = args;

        this.setProperty(path, results);
        this.shadowModel.setProperty(path, results);
        this.nest(path, results, true);
      },

      async update(obj) {
        const path = `/${obj.__metadata.uri
          .replace(location.origin, "")
          .replace(this.serviceURL, "")}`;
        const entityName = path.split("(")[0];

        const result = await this.odata.update(path, obj);

        const data = this.getProperty(entityName).map((entity) => {
          if (entity.__metadata.uri.includes(path)) return result;
          return entity;
        });

        this.setProperty(path, data);
        this.shadowModel.setProperty(path, data);
        this.nest(path, data, true);
      },

      async remove(obj) {
        const path = `/${obj.__metadata.uri
          .replace(location.origin, "")
          .replace(this.serviceURL, "")}`;
        const entityName = path.split("(")[0];

        await this.odata.remove(path);

        const data = this.getProperty(entityName).filter(
          (entity) => !entity.__metadata.uri.includes(path)
        );

        this.setProperty(entityName, data);
        this.shadowModel.setProperty(path, data);
        this.nest(entityName, data, true);
      },

      nest(path, array, shallNest, nestName, link) {
        if (!shallNest) return;
        const nested = nest(array, nestName, link);
        this.setProperty(`${path}Nested`, nested);

        console.log(dotprop.deepKeys(nested));
      },
    });
  }
);
