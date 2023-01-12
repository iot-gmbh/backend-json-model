sap.ui.define(["sap/fe/test/ListReport"], (ListReport) => {
  const CustomPageDefinitions = {
    actions: {},
    assertions: {},
  };

  return new ListReport(
    {
      appId: "leave",
      componentId: "LeavesList",
      entitySet: "Leaves",
    },
    CustomPageDefinitions
  );
});
