/**
 * Implements the print function in the ObjectPage.
 */
sap.ui.define(["../pdfGenerator/pdfGenerator"], (PDFGenerator) => ({
  onPrint(event) {
    const { startDate, endDate, durationInDays, user } = event.getObject();

    // generate PDF
    const i18n = this.getModel("i18n").getResourceBundle();
    PDFGenerator.generatePDF(
      {
        startDate,
        endDate,
        businessDays: durationInDays,
        name: user.displayName,
      },
      i18n
    );
  },
}));
