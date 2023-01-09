/* global pdfMake */

/**
 * Defines a new ui-module which creates a PDF from the given data.
 */
sap.ui.define(["sap/ui/core/format/DateFormat"], (DateFormat) => ({
  generatePDF(data, i18n) {
    const fontSize = 11;
    const formatter = DateFormat.getDateInstance({ pattern: "dd. MMMM yyyy" });
    const today = formatter.format(new Date());
    const startDate = formatter.format(new Date(data.startDate));
    const endDate = formatter.format(new Date(data.endDate));
    const names = data.name.split(" ");

    const docDefinition = {
      pageSize: "A4",
      content: [
        {
          text: i18n.getText("vacationRequest"),
          bold: true,
          fontSize: fontSize * 1.3,
          margin: [6, 0, 0, 0],
        },
        {
          table: {
            widths: "auto",
            body: [
              [`${i18n.getText("lastName")}: `, names[1]],
              [`${i18n.getText("firstName")}: `, names[0]],
            ],
          },
          layout: { defaultBorder: false },
          margin: [0, 20, 0, 20],
        },
        {
          table: {
            body: [
              [
                `${i18n.getText("requestText")} `,
                `${i18n.getText("requestFrom")} `,
                startDate,
              ],
              ["", `${i18n.getText("requestUntil")} `, endDate],
              [{ margin: [0, 0, 0, fontSize * 0.25], text: "" }, "", ""],
              [`${i18n.getText("numOfVacDays")}: `, data.businessDays, ""],
            ],
          },
          layout: { defaultBorder: false },
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            widths: ["auto", 250],
            body: [
              [`${i18n.getText("date")}: `, today],
              // [{ margin: [0, 0, 0, fontSize], text: "" }, ""],
              // [
              //   "Unterschrift:",
              //   { border: [false, false, false, true], text: "" },
              // ],
            ],
          },
          layout: { defaultBorder: false },
        },
      ],
      defaultStyle: {
        fontSize,
      },
    };

    pdfMake.createPdf(docDefinition).open();
  },
}));
