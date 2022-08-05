sap.ui.define([], () => ({
  /**
   * Rounds the number unit value to 2 digits
   * @public
   * @param {string} sValue the number string to be rounded
   * @returns {string} sValue with 2 digits rounded
   */
  numberUnit(sValue) {
    if (!sValue) {
      return "";
    }
    return parseFloat(sValue).toFixed(2);
  },
}));
