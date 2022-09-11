const cds = require("@sap/cds");
const moment = require("moment");

module.exports = cds.service.impl(async function () {
  this.on("READ", "IOTWorkItems", async (req) => {
    const { query } = req;

    const selectDatumBis = query?.SELECT?.columns?.find((column) => {
      if (!column || !column.ref) return false;
      return column.ref[0] === "DatumBis";
    });

    if (!selectDatumBis) {
      if (!query.SELECT?.columns) {
        query.SELECT.columns = [];
      }
      // Hidden in UI, thus add it manually
      query.SELECT.columns.push({ ref: ["DatumBis"] });
    }

    const items = await cds.tx(req).run(query);

    const IOTWorkItems = items.map((itm) => ({
      ID: itm.ID,
      Datum: moment(itm.Datum).format("DD.MM.yyyy"),
      Beginn: moment(itm.Datum).add(2, "hours").format("HH:mm"),
      Ende: moment(itm.DatumBis).add(2, "hours").format("HH:mm"),
      P1: itm.P1,
      Kunde: itm.Kunde,
      Projekt: itm.Projekt,
      Teilprojekt: itm.Teilprojekt,
      Arbeitspaket: itm.Arbeitspaket,
      ProjektAlias: itm.ProjektAlias,
      TeilprojektAlias: itm.TeilprojektAlias,
      ArbeitspaketAlias: itm.ArbeitspaketAlias,
      Taetigkeit: "Durchführung",
      Nutzer: itm.Nutzer,
      Einsatzort: itm.Einsatzort,
      P2: itm.P2,
      Bemerkung: itm.Bemerkung,
    }));

    return IOTWorkItems;
  });
});
