sap.ui.define([], () => ({
  /**
   * Rounds the number unit value to 2 digits
   * @public
   * @param {string} sValue the number string to be rounded
   * @returns {string} sValue with 2 digits rounded
   */
  toFixed2(sValue) {
    if (!sValue) {
      return "";
    }
    return parseFloat(sValue).toFixed(2);
  },

  getRelativeDuration(
    relDuration,
    relAccDuration,
    hierarchyLevel,
    expandToLevel
  ) {
    // eslint-disable-next-line eqeqeq
    if (hierarchyLevel == expandToLevel) {
      return relAccDuration;
    }
    return relDuration;
  },
}));
