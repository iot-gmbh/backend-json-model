sap.ui.define(["sap/ui/core/Control"], (e) =>
  e.extend("workitems.control.If", {
    metadata: {
      interfaces: ["sap.ui.core.IFormContent"],
      aggregations: {
        content: { singularName: "content", type: "sap.ui.core.Control" },
      },
      defaultAggregation: "content",
      properties: { condition: { type: "boolean", defaultValue: false } },
    },
    renderer(e, n) {
      e.openStart("div", n);
      e.openEnd();
      const o = n.getContent();
      if (o.length !== 1 && o.length !== 2) {
        throw new Error(
          "<If> expects one or two children; first for then-case, second for optional else-case."
        );
      }
      if (n.getCondition() === true) {
        e.renderControl(o[0]);
      } else if (o[1] !== undefined) {
        e.renderControl(o[1]);
      }
      e.close("div");
    },
  })
);
