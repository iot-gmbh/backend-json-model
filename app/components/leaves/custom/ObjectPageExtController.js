/**
 * Implements the print function in the ObjectPage.
 */
sap.ui.define(["../pdfGenerator/pdfGenerator"], (PDFGenerator) => ({
  onPrint(event) {
    const i18n = this.getModel("i18n").getResourceBundle();
    event.requestObject().then((boundObject) => {
      const data = {
        startDate: boundObject.startDate,
        endDate: boundObject.endDate,
        businessDays: boundObject.durationInDays,
        name: boundObject.user.displayName,
      };

      // generate PDF
      PDFGenerator.generatePDF(data, i18n);
    });
  },
}));
