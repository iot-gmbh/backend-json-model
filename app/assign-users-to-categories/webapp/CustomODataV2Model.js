/* eslint-disable no-restricted-globals */

sap.ui.define(
  ["sap/ui/model/odata/v2/ODataModel", "sap/ui/model/json/JSONModel"],
  (ODataModel, JSONModel) => {
    function _promisify(model, method, paramsIndex) {
      // eslint-disable-next-line func-names
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

    return JSONModel.extend("iot.ODataModelV2", {
      // eslint-disable-next-line object-shorthand, func-names
      constructor: function (serviceURL, ...args) {
        JSONModel.apply(this, ...args);

        const odataModel = new ODataModel(serviceURL);

        odataModel.metadataLoaded().then(() => {
          [this.schema] = odataModel.getServiceMetadata().dataServices.schema;
          this.associations = this.schema.association;
          this.entityTypes = this.schema.entityType.map(
            ({ name, property, key, navigationProperty = [] }) => ({
              name,
              keys: key.propertyRef.map((k) => k.name),
              properties: property,
              relations: navigationProperty.map(
                ({ name: navPropName, relationship, fromRole, toRole }) => {
                  const association = this.associations.find(
                    ({ name: assocName }) =>
                      `${this.schema.namespace}.${assocName}` === relationship
                  );

                  const {
                    referentialConstraint: { dependent, principal } = {
                      dependent: { propertyRef: [] },
                      principal: { propertyRef: [] },
                    },
                    end,
                  } = association;

                  return {
                    name: navPropName,
                    fromRole,
                    toRole,
                    cardinality: end.find((e) => e.role === toRole)
                      .multiplicity,
                    refConstraints: dependent.propertyRef.map((dep, index) => {
                      const princ = principal.propertyRef[index];
                      return {
                        from: (dependent.role === fromRole ? dep : princ).name,
                        to: (dependent.role === toRole ? dep : princ).name,
                      };
                    }),
                  };
                }
              ),
            })
          );

          // Initialize with empty arrays
          this.setData(
            this.entityTypes
              .map(({ name }) => name)
              .reduce((acc, curr) => ({ ...acc, [curr]: [] }), {})
          );
        });

        this.serviceURL = serviceURL;
        this.ODataModel = odataModel;

        this.odata = {
          create: _promisify(odataModel, "create", 2),
          read: _promisify(odataModel, "read", 1),
          query: _promisify(odataModel, "read", 1),
          update: _promisify(odataModel, "update", 2),
          remove: _promisify(odataModel, "remove", 1),
          callFunction: _promisify(odataModel, "callFunction", 1),
        };
      },

      async callFunction(...args) {
        return this.odata.callFunction(...args);
      },

      async read(...args) {
        const { results } = await this.odata.read(...args);

        return results;
      },

      // = read + store
      async load(...args) {
        const { results } = await this.odata.read(...args);
        const [path, { into }] = args;
        const loadInto = into || path;

        this.setProperty(loadInto, results);

        return results;
      },

      async create(...args) {
        const [path, { localPath, ...object }] = args;
        const result = await this.odata.create(path, object);
        const parentPath = localPath.substring(0, localPath.lastIndexOf("/"));

        const resultWithoutNavProps = this.removeNavPropsFrom(result);

        const data = this.getProperty(parentPath);

        data.push({ ...resultWithoutNavProps, ...object });

        this.setProperty(parentPath, data);
        // this.nest();
      },

      // create new obj => nav-Props will be deleted so don't use reference
      async update({ localPath, ...obj }) {
        const odataPath = this.getODataPathFrom(obj);
        const data = this.removeNavPropsFrom(obj);

        await this.odata.update(odataPath, data);

        this.setProperty(localPath, { ...obj, ...data });
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
        this.nest();
      },

      nest() {
        const data = this.getData();
        const { entityTypes } = this;

        entityTypes
          // Only process entities that are loaded already
          .filter(({ name }) => data[name])
          .map((entityType) => ({
            entityType,
            entities: data[entityType.name].filter(Boolean).map((entity) => {
              entityType.relations.forEach((relation) => {
                const cardinality = relation.cardinality.endsWith("1")
                  ? "1"
                  : "n";

                if (cardinality === "n") {
                  // eslint-disable-next-line no-param-reassign
                  entity[relation.name] = entity[relation.name].results;
                }

                // Object.defineProperty(entity, relation.name, {
                //   configurable: true,
                //   // We don't implement a setter by design so each request has to be made via the OData-service explicitly
                //   get: () => {
                //     const targetEntities =
                //       this.getData()[relation.toRole] || [];
                //     const results = targetEntities.filter((related) =>
                //       relation.refConstraints.every(
                //         ({ to, from }) => related[to] === entity[from]
                //       )
                //     );

                //     if (cardinality === "1") {
                //       return results[0];
                //     }

                //     return results;
                // },
                // });
              });
              return entity;
            }),
          }))
          .forEach(({ entityType, entities }) => {
            this.setProperty(`/${entityType.name}`, entities);
          });
      },

      getODataPathFrom(obj) {
        const odataPath = `/${obj.__metadata.uri
          .replace(location.origin, "")
          .replace(this.serviceURL, "")}`;
        return odataPath;
      },

      removeNavPropsFrom({ ...obj }) {
        const odataPath = this.getODataPathFrom(obj);
        const entityTypeName = odataPath.split("(")[0].slice(1);
        const entityType = this.entityTypes.find(
          ({ name }) => name === entityTypeName
        );

        // nav-Props throw errors => delete them upfront
        entityType.relations.forEach(({ name }) => {
          // eslint-disable-next-line no-param-reassign
          delete obj[name];
        });

        return obj;
      },

      async metadataLoaded() {
        return this.ODataModel.metadataLoaded();
      },
    });
  }
);
