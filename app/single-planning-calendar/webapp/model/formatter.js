const types = {
  Manual: {
    Allocated: {
      Billed: 1,
      NotBilled: 8,
    },
    NotAllocated: {
      Billed: 3,
      NotBilled: 4,
    },
  },
  WorkItem: {
    Allocated: {
      Billed: 5,
      NotBilled: 6,
    },
    NotAllocated: {
      Billed: 7,
      NotBilled: 8,
    },
  },
  Event: {
    Allocated: {
      Billed: 9,
      NotBilled: 10,
    },
    NotAllocated: {
      Billed: 11,
      NotBilled: 12,
    },
  },
};

sap.ui.define([], () => ({
  getDisplayType(eventType, projectID, status) {
    const allocationStatus = projectID ? "Allocated" : "NotAllocated";
    const billingStatus = status === "Billed" ? "Billed" : "NotBilled";

    try {
      const typeNo = types[eventType][allocationStatus][billingStatus];
      const type = "Type" + String(typeNo).padStart(2, "0");
      if (!type) return "Type01";
      else return type;
    } catch (error) {
      return "Type01";
    }
  },

  getIconURL(customerID) {
    if (!customerID) return undefined;
    if (location.hostname.startsWith("localhost"))
      return `./img/${customerID}.png`;
    else
      return `.iotprojectplanning.iot.singleplanningcalendar/img/${customerID}.png`;
  },
}));
