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
    return this.getOwnerComponent()
      .getManifestObject()
      .resolveUri(`./img/${customerID}.png`);
    // return `./img/${customerID}.png`;
    // if (location.hostname.startsWith("localhost"))
    // else
    //   return `iotprojectplanning.iot.singleplanningcalendar/img/${customerID}.png`;
  },

  getReferenceAndText(absoluteReference, shallowReference, text) {
    if (absoluteReference) return `${absoluteReference}: ${text}`;
    if (shallowReference) return `${shallowReference}: ${text}`;
    return text;
  },
}));
