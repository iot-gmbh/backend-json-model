sap.ui.define([], () => ({
  getDisplayType: function (eventType) {
    switch (eventType) {
      case "Manual":
        return "Type16";
      case "WorkItem":
        return "Type08";
      case "Event":
        return "Type01";
      default:
        return "Type12";
    }
  },
}));
