sap.ui.define(["sap/fe/test/ObjectPage"], (ObjectPage) => {
  const CustomPageDefinitions = {
    actions: {},
    assertions: {},
  };

  return new ObjectPage(
    {
      appId: "leave",
      componentId: "LeavesObjectPage",
      entitySet: "Leaves",
    },
    CustomPageDefinitions
  );
});
