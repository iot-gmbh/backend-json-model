sap.ui.define(["../model/legendItems"], (legendItems) => ({
  getDisplayType(eventType, projectID, status) {
    const allocationStatus = projectID ? "Allocated" : "NotAllocated";
    const billingStatus = status === "Billed" ? "Billed" : "NotBilled";
    const { type } = legendItems.getItems()[
      `${eventType}_${allocationStatus}_${billingStatus}`
    ] || { type: "Type01" };

    return type;
  },

  getIconURL(customerID) {
    if (!customerID) return undefined;
    if (location.hostname.startsWith("localhost"))
      return `./img/${customerID}.png`;
    else
      return `.iotprojectplanning.iot.singleplanningcalendar/img/${customerID}.png`;
  },
}));
