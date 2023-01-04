/**
 * Implements the print function in the ObjectPage.
 */
sap.ui.define([
    "../pdfGenerator/pdfGenerator"
], function(PDFGenerator) {
    'use strict';

    return {

        onPrint: function(oEvent) {
            let oModel = oEvent.getModel();
            let oBindings = oModel.getAllBindings();
            console.log(oBindings);

            let data = {};

            // search correct binding to retrieve relevant info
            oBindings.forEach((binding) => {
                if (binding.sPath === 'startDate') {
                    data.startDate = binding.vValue;
                } else if (binding.sPath === 'endDate') {
                    data.endDate = binding.vValue;
                }  else if (binding.sPath === 'durationInDays') {
                    data.businessDays = binding.vValue;
                } else if (binding.sPath === 'user/displayName') {
                    data.name = binding.vValue;
                }
            });

            // generate PDF
            let i18n = this.getModel("i18n").getResourceBundle();
            PDFGenerator.generatePDF(data, i18n);
        }
    };
});
