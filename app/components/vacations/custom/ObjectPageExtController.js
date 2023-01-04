/**
 * Implements the print function in the ObjectPage.
 */
sap.ui.define(["../pdfGenerator/pdfGenerator"], (PDFGenerator) => ({
  onPrint(oEvent) {
    const oModel = oEvent.getModel();
    const oBindings = oModel.getAllBindings();

    const data = {};

    // search correct binding to retrieve relevant info
    oBindings.forEach((binding) => {
      if (binding.sPath === "startDate") {
        data.startDate = binding.vValue;
      } else if (binding.sPath === "endDate") {
        data.endDate = binding.vValue;
      } else if (binding.sPath === "durationInDays") {
        data.businessDays = binding.vValue;
      } else if (binding.sPath === "user/displayName") {
        data.name = binding.vValue;
      }
    });

    // generate PDF
    const i18n = this.getModel("i18n").getResourceBundle();
    PDFGenerator.generatePDF(data, i18n);
  },
}));
