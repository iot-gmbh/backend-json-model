sap.ui.define([], () => ({
  duration(value) {
    if (!value) {
      return "";
    }
    return `${value} h`;
  },

  braceDeepReference(title, deepReference) {
    return `${title} (${deepReference})`;
  },
}));