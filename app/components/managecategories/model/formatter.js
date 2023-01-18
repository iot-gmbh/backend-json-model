sap.ui.define([], () => ({
  /**
   * Rounds the number unit value to 2 digits
   * @public
   * @param {string} value the number string to be rounded
   * @returns {string} sValue with 2 digits rounded
   */
  toFixed0(value) {
    if (!value) {
      return "";
    }
    return parseFloat(value).toFixed(0);
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
