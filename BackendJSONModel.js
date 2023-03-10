/* eslint-disable no-restricted-globals */
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global = global || self), (global.deepmerge = factory()));
})(this, () => {
  const isMergeableObject = function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
  };

  function isNonNullObject(value) {
    return !!value && typeof value === "object";
  }

  function isSpecial(value) {
    const stringValue = Object.prototype.toString.call(value);

    return (
      stringValue === "[object RegExp]" ||
      stringValue === "[object Date]" ||
      isReactElement(value)
    );
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  const canUseSymbol = typeof Symbol === "function" && Symbol.for;
  const REACT_ELEMENT_TYPE = canUseSymbol
    ? Symbol.for("react.element")
    : 0xeac7;

  function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
  }

  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
  }

  function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && options.isMergeableObject(value)
      ? deepmerge(emptyTarget(value), value, options)
      : value;
  }

  function defaultArrayMerge(target, source, options) {
    return target
      .concat(source)
      .map((element) => cloneUnlessOtherwiseSpecified(element, options));
  }

  function getMergeFunction(key, options) {
    if (!options.customMerge) {
      return deepmerge;
    }
    const customMerge = options.customMerge(key);
    return typeof customMerge === "function" ? customMerge : deepmerge;
  }

  function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols
      ? Object.getOwnPropertySymbols(target).filter((symbol) =>
          target.propertyIsEnumerable(symbol)
        )
      : [];
  }

  function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
  }

  function propertyIsOnObject(object, property) {
    try {
      return property in object;
    } catch (_) {
      return false;
    }
  }

  // Protects from prototype poisoning and unexpected merging up the prototype chain.
  function propertyIsUnsafe(target, key) {
    return (
      propertyIsOnObject(target, key) && // Properties are safe to merge if they don't exist in the target yet,
      !(
        Object.hasOwnProperty.call(target, key) && // unsafe if they exist up the prototype chain,
        Object.propertyIsEnumerable.call(target, key)
      )
    ); // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
    const destination = {};
    if (options.isMergeableObject(target)) {
      getKeys(target).forEach((key) => {
        destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
      });
    }
    getKeys(source).forEach((key) => {
      if (propertyIsUnsafe(target, key)) {
        return;
      }

      if (
        propertyIsOnObject(target, key) &&
        options.isMergeableObject(source[key])
      ) {
        destination[key] = getMergeFunction(key, options)(
          target[key],
          source[key],
          options
        );
      } else {
        destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
      }
    });
    return destination;
  }

  function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

    const sourceIsArray = Array.isArray(source);
    const targetIsArray = Array.isArray(target);
    const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    if (!sourceAndTargetTypesMatch) {
      return cloneUnlessOtherwiseSpecified(source, options);
    }
    if (sourceIsArray) {
      return options.arrayMerge(target, source, options);
    }
    return mergeObject(target, source, options);
  }

  deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
      throw new Error("first argument should be an array");
    }

    return array.reduce((prev, next) => deepmerge(prev, next, options), {});
  };

  const deepmerge_1 = deepmerge;

  return deepmerge_1;
});

// Release notes
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
      constructor: function (serviceURL, options = {}) {
        const { data = {}, observe = false, synchronize = true } = options;
        JSONModel.apply(this, data, observe);

        const odataModel = new ODataModel(serviceURL, options);

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

        this._serviceURL = serviceURL;
        this._ODataModel = odataModel;
        this._synchronize = synchronize;

        this._promises = {
          create: _promisify(odataModel, "create", 2),
          read: _promisify(odataModel, "read", 1),
          query: _promisify(odataModel, "read", 1),
          update: _promisify(odataModel, "update", 2),
          remove: _promisify(odataModel, "remove", 1),
          callFunction: _promisify(odataModel, "callFunction", 1),
        };

        this.isMetadataLoadingFailed = (e) =>
          odataModel.isMetadataLoadingFailed(e);
        this.attachMetadataFailed = (e) => odataModel.attachMetadataFailed(e);
        this.metadataLoaded = (e) => this._ODataModel.metadataLoaded(e);
      },

      destroy(...args) {
        // this._ODataModel.destroy();
        // this._serviceURL = undefined;
        // this._promises = undefined;
        // this.isMetadataLoadingFailed = undefined;
        // this.attachMetadataFailed = undefined;
        // this.metadataLoaded = undefined;
        // call the base component's destroy function
        // JSONModel.prototype.destroy.apply(this, ...args);
      },

      setHeaders(headers) {
        this._ODataModel.setHeaders(headers);
      },

      getODataModel() {
        return this._ODataModel;
      },

      async callFunction(...args) {
        const result = await this._promises.callFunction(...args);
        return result;
      },

      async read(...args) {
        const { results } = await this._promises.read(...args);

        return results;
      },

      // = read + store
      async load(...args) {
        const { results } = await this._promises.read(...args);
        const [path, { into = path, nest } = {}] = args;

        if (nest) {
          const nestedResults = this.nest({ items: results, ...nest });
          this.setProperty(`${into}Nested`, nestedResults);
        }

        this.setProperty(into, results);

        return results;
      },

      nest({
        items,
        ID = null,
        navigationProperty = "children",
        identifierName = "ID",
        link = "parent_ID",
      }) {
        return items
          .filter((item) => item[link] === ID)
          .map((item) => ({
            ...item,
            [navigationProperty]: this.nest({
              items,
              ID: item[identifierName],
              navigationProperty,
              identifierName,
              link,
            }),
          }));
      },

      async create(
        path,
        { localPath = `${path}/X`, ...object } = {},
        synchronize = true,
        removeNavProps = true
      ) {
        let resultWithoutNavProps = {};

        if (this._synchronize && synchronize) {
          const result = await this._promises.create(path, object);
          resultWithoutNavProps = this.removeNavPropsFrom(result);
        }

        const merge = { ...resultWithoutNavProps, ...object };
        const dataLocation = localPath.substring(0, localPath.lastIndexOf("/"));
        const data = this.getProperty(dataLocation);

        data.push(merge);

        this.setProperty(dataLocation, data);

        return merge;
      },

      _flattenResults(obj) {
        if (Array.isArray(obj)) {
          return obj.map((entry) => this._flattenResults(entry));
        }

        return Object.entries(obj).reduce((acc, [key, value]) => {
          if (value && value.results) {
            acc[key] = this._flattenResults(value.results);
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});
      },

      async deepCreate(parentPath, object) {
        const existingItem = this.findObject(parentPath, object) || {};
        const { keys } = this.getEntityTypeFrom(parentPath);

        // https://github.com/TehShrike/deepmerge
        const combineMerge = (target, source, options) => {
          const destination = target.slice();

          source.forEach((item, index) => {
            const destIndex = destination.findIndex((destItem) =>
              keys.every(
                (key) =>
                  destItem[key] === item[key] || !destItem[key] || !item[key]
              )
            );

            if (destIndex === -1) {
              destination.push(item);
            } else if (typeof destination[destIndex] === "undefined") {
              destination[destIndex] = options.cloneUnlessOtherwiseSpecified(
                item,
                options
              );
            } else if (options.isMergeableObject(item)) {
              destination[destIndex] = deepmerge(target[index], item, options);
            }
          });
          return destination;
        };

        const result = await this._promises.create(parentPath, object);

        const mergeRequestWithResult = deepmerge(
          object,
          this._flattenResults(result),
          {
            arrayMerge: combineMerge,
          }
        );

        const mergeWithExisting = deepmerge(
          existingItem,
          mergeRequestWithResult,
          {
            arrayMerge: combineMerge,
          }
        );

        if (!this.isEmpty(existingItem)) {
          this.setProperty(existingItem.localPath, mergeWithExisting);
        } else {
          const data = this.getProperty(parentPath);
          data.push(mergeWithExisting);
          this.setProperty(parentPath, data);
        }

        return mergeWithExisting;
      },

      isEmpty(obj) {
        return Object.keys(obj).length === 0;
      },

      getEntityTypeFrom(parentPath) {
        const entityTypeName = parentPath.substring(1);
        const entityType = this.entityTypes.find(
          ({ name }) => name === entityTypeName
        );
        return entityType;
      },

      findObject(parentPath, object) {
        const entityType = this.getEntityTypeFrom(parentPath);
        const items = this.getProperty(parentPath);

        const index = items.findIndex((item) =>
          entityType.keys.every((key) => item[key] === object[key])
        );

        if (index < 0) {
          return false;
        }

        const result = items[index];
        return { ...result, localPath: `${parentPath}/${index}` };
      },

      // create new obj => nav-Props will be deleted so don't use reference
      async update(
        { localPath, ...obj },
        synchronize = true,
        removeNavProps = true
      ) {
        let merge = obj;

        if (this._synchronize && synchronize) {
          const odataPath = this.getODataPathFrom(obj);
          const data = removeNavProps ? this.removeNavPropsFrom(obj) : obj;
          const result = await this._promises.update(odataPath, data);
          const cleanResult = this.sliceDeferredProperties(result);
          merge = { ...obj, ...cleanResult };
        }

        this.setProperty(localPath, merge);

        return merge;
      },

      async remove(obj, synchronize = true) {
        const path = this.getODataPathFrom(obj);
        const entityName = path.split("(")[0];

        if (this._synchronize && synchronize) {
          await this._promises.remove(path);
        }

        const data = this.getProperty(entityName).filter(
          (entity) => !entity.__metadata.uri.includes(path)
        );

        this.setProperty(entityName, data);
      },

      sliceDeferredProperties(obj) {
        const sliced = Object.entries(obj)
          .filter(([, value]) => !!value && !value.__deferred)
          .reduce((map, [key, value]) => {
            // eslint-disable-next-line no-param-reassign
            map[key] = value;
            return map;
          }, {});

        return sliced;
      },

      getODataPathFrom(obj) {
        const url = new URL(obj.__metadata.uri);
        const odataPath = url.pathname.replace(this._serviceURL, "/");
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
    });
  }
);
