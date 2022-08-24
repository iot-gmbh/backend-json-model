/* eslint-disable no-restricted-globals */

sap.ui.define(["sap/ui/model/json/JSONModel"], (JSONModel) => {
  const nest = (items, ID = null, nestName = "children", link = "parent_ID") =>
    items
      .filter((item) => item[link] === ID)
      .map((item) => ({ ...item, [nestName]: nest(items, item.ID) }));

  const reduce = (array, isNest, nestPropertyName = "children") =>
    array.reduce((acc, curr) => {
      const accUpd = {
        ...acc,
        [curr.__metadata.uri]: {
          ...curr,
          key: curr.__metadata.uri,
        },
      };

      if (isNest) {
        acc[nestPropertyName] = reduce(curr[nestPropertyName]);
      }

      return accUpd;
    }, {});

  return JSONModel.extend("iot.ShadowModel", {
    // eslint-disable-next-line object-shorthand, func-names
    constructor: function (...args) {
      JSONModel.apply(this, ...args);
    },

    setPropertyExt(...args) {
      this.setProperty(...args);
    },
  });
});
