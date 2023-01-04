sap.ui.define(["../model/legendItems"], (legendItems) => {
  function msToHM(ms) {
    return new Date(ms).toISOString().substring(11, 16);
  }

  return {
    getWorkingTimeQuote(is, should) {
      const quote = (Number(is) / Number(should)).toFixed(2) * 100;
      if (quote > 100) return 100;
      return quote;
    },

    getDisplayType(eventType, status) {
      // const allocationStatus = projectID ? "Allocated" : "NotAllocated";
      const billingStatus = status === "Billed" ? "Billed" : "NotBilled";
      const { type } = legendItems.getItems()[
        `${eventType}.Allocated.${billingStatus}`
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
      //   return `iotprojectplanning.iot.planner.components.singleplanningcalendar/img/${customerID}.png`;
    },

    getReferenceAndText(absoluteReference, shallowReference, text) {
      if (absoluteReference) return `${absoluteReference}: ${text}`;
      if (shallowReference) return `${shallowReference}: ${text}`;
      return text;
    },

    highlightFilter(text, query) {
      if (!(text && query)) return text;
      return text.replace(query, `<strong>${query}</strong>`);
    },

    getDuration(activatedDate, completedDate) {
      const diff = completedDate - activatedDate;
      const time = msToHM(diff);
      return time;
    },
  };
});
