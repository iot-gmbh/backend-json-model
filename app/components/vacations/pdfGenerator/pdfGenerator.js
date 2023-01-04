/* global pdfMake */

/**
 * Defines a new ui-module which creates a PDF from the given data.
 */
sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function(DateFormat) {
    "use strict";

    return {
        generatePDF(data, i18n) {

            let fontSize = 11;
            let formatter = DateFormat.getDateInstance({pattern: "dd. MMMM yyyy"});
            let today = formatter.format(new Date());
            let startDate = formatter.format(new Date(data.startDate));
            let endDate = formatter.format(new Date(data.endDate));
            let names = data.name.split(" ");

            let docDefinition = {
                pageSize: 'A4',
                content: [
                    {
                        text: i18n.getText("vacationRequest"),
                        bold: true,
                        fontSize: fontSize * 1.3,
                        margin: [6, 0, 0, 0]
                    }, {
                        table: {
                            widths: 'auto',
                            body: [
                                ["Nachname: ", names[1]],
                                ["Vorname: ", names[0]]                                
                            ]
                        }, layout: {defaultBorder: false}, margin: [0, 20, 0, 20]
                    }, {
                        table: {
                            body: [
                                ["Ich beantrage Urlaub ", "vom", startDate],
                                ["", "bis einschl. ", endDate],
                                [{margin: [0, 0, 0, fontSize * 0.25], text: ""}, "", ""],
                                ["Anzahl Arbeitstage: ", data.businessDays, ""]
                            ]
                        }, layout: {defaultBorder: false}, margin: [0, 0, 0, 20]
                    }, {
                        table: {
                            widths: ['auto', 250],
                            body: [
                                ["Datum: ", today],
                                [{margin: [0, 0, 0, fontSize], text: ""}, ""],
                                ["Unterschrift:", {border: [false, false, false, true], text: ""}]
                            ]
                        }, layout: {defaultBorder: false},
                    }
                ],
                defaultStyle: {
                    fontSize: fontSize
                }
            };
            
            pdfMake.createPdf(docDefinition).open();
        }
    };
});
