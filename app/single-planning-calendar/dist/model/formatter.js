sap.ui.define(["../model/legendItems"], (e) => ({
  getDisplayType(t, n, l) {
    const i = n ? "Allocated" : "NotAllocated";
    const o = l === "Billed" ? "Billed" : "NotBilled";
    const { type: d } = e.getItems()[`${t}_${i}_${o}`] || { type: "Type01" };
    return d;
  },
  getIconURL(e) {
    if (!e) return undefined;
    return this.getOwnerComponent()
      .getManifestObject()
      .resolveUri(`./img/${e}.png`);
  },
}));
