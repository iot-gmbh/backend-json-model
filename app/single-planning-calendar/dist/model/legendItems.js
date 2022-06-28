sap.ui.define([], () => ({
  getItems() {
    return {
      Manual_Allocated_Billed: { type: "Type01" },
      Manual_Allocated_NotBilled: { type: "Type02" },
      Manual_NotAllocated_Billed: { type: "Type03" },
      Manual_NotAllocated_NotBilled: { type: "Type04" },
      WorkItem_Allocated_Billed: { type: "Type05" },
      WorkItem_Allocated_NotBilled: { type: "Type06" },
      WorkItem_NotAllocated_Billed: { type: "Type07" },
      WorkItem_NotAllocated_NotBilled: { type: "Type08" },
      Event_Allocated_Billed: { type: "Type09" },
      Event_Allocated_NotBilled: { type: "Type10" },
      Event_NotAllocated_Billed: { type: "Type11" },
      Event_NotAllocated_NotBilled: { type: "Type12" },
    };
  },
}));
