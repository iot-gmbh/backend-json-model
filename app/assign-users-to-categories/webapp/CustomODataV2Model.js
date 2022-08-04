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

    return JSONModel.extend("iot.ODataModelV2", {
      // eslint-disable-next-line object-shorthand, func-names
      constructor: function (serviceURL, ...args) {
        JSONModel.apply(this, ...args);

        const odataModel = new ODataModel(serviceURL);
        this.shadowModel = new JSONModel();

        odataModel.metadataLoaded().then(() => {
          [this.schema] = odataModel.getServiceMetadata().dataServices.schema;
          this.associations = this.schema.association;
          this.entityTypes = this.schema.entityType.map(
            ({ name, property, navigationProperty }) => ({
              name,
              properties: property,
              relations: navigationProperty.map(
                ({ name: navPropName, relationship, fromRole, toRole }) => ({
                  name: navPropName,
                  fromRole,
                  toRole,
                  refConstraints: this.associations
                    .filter(
                      ({ name: assocName }) =>
                        `${this.schema.namespace}.${assocName}` === relationship
                    )
                    .flatMap(({ referentialConstraint }) => ({
                      from: (referentialConstraint.dependent.role === fromRole
                        ? referentialConstraint.dependent.propertyRef
                        : referentialConstraint.principal.propertyRef)[0].name,
                      to: (referentialConstraint.dependent.role === toRole
                        ? referentialConstraint.dependent.propertyRef
                        : referentialConstraint.principal.propertyRef)[0].name,
                    })),
                })
              ),
            })
          );
        });

        this.serviceURL = serviceURL;

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
        this.nest();
      },

      async read(...args) {
        const { results } = await this.odata.read(...args);

        return results;
      },

      async load(...args) {
        const { results } = await this.odata.read(...args);
        const [path] = args;

        // this.setProperty(path, results);
        this.setProperty(path, results);
        this.nest();
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
        this.nest();
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

        this.entityTypes
          // Only process entities that are loaded already
          .filter(({ name }) => data[name])
          .map((entityType) => ({
            entityType,
            entities: data[entityType.name].filter(Boolean).map((entity) => {
              entityType.relations.forEach((relation) => {
                Object.defineProperty(entity, relation.name, {
                  get: () => {
                    const targetEntities = this.getData()[relation.toRole];
                    if (!targetEntities) return [];
                    return targetEntities.filter((related) =>
                      relation.refConstraints.every(
                        ({ to, from }) => related[to] === entity[from]
                      )
                    );
                  },
                });
              });
              return {
                entityType,
                ...entity,
              };
            }),
          }))
          .forEach(({ entityType, entities }) => {
            this.setProperty(`/${entityType.name}`, entities);
          });
      },
    });
  }
);
