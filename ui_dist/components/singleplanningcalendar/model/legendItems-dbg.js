/* eslint-disable camelcase */
sap.ui.define([], () => ({
  getItems() {
    return {
      "Manual.Allocated.Billed": {
        type: "Type01",
      },
      "Manual.Allocated.NotBilled": {
        type: "Type02",
      },
      "Manual.NotAllocated.Billed": {
        type: "Type03",
      },
      "Manual.NotAllocated.NotBilled": {
        type: "Type04",
      },
      "AzureDevOpsWorkItem.Allocated.Billed": {
        type: "Type05",
      },
      "AzureDevOpsWorkItem.Allocated.NotBilled": {
        type: "Type06",
      },
      "AzureDevOpsWorkItem.NotAllocated.Billed": {
        type: "Type07",
      },
      "AzureDevOpsWorkItem.NotAllocated.NotBilled": {
        type: "Type08",
      },
      "MSGraphEvent.Allocated.Billed": {
        type: "Type09",
      },
      "MSGraphEvent.Allocated.NotBilled": {
        type: "Type10",
      },
      "MSGraphEvent.NotAllocated.Billed": {
        type: "Type11",
      },
      "MSGraphEvent.NotAllocated.NotBilled": {
        type: "Type12",
      },
    };
  },
}));
