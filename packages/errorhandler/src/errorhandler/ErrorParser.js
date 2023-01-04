sap.ui.define(["sap/ui/base/Object"], (UI5Object) =>
  UI5Object.extend("errorhandler.ErrorParser", {
    // eslint-disable-next-line object-shorthand
    constructor: function ({ resBundle } = {}, ...args) {
      UI5Object.apply(this, args);

      this.resBundle = resBundle;
    },

    extractErrorTextFrom(error) {
      if (error && error.message) return error.message;

      try {
        return this.extractErrorMsgFromJSON(error);
      } catch (errJSON) {
        try {
          return this.extractErrorMsgFromXML(error);
        } catch (errXML) {
          return this.resBundle.getText("errorMessageCouldNotBeParsed");
        }
      }
    },

    extractErrorMsgFromXML(error) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(error, "text/xml");
      return xmlDoc
        .getElementsByTagName("error")[0]
        .getElementsByTagName("message")[0].childNodes[0].wholeText;
    },

    extractErrorMsgFromJSON(error) {
      const parsedError = JSON.parse(error);

      // Safely accessing deeply nested properties:
      // https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
      const get = (p, o) =>
        p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

      return (
        get(["error", "message", "value"], parsedError) ||
        this.resBundle.getText("errorMessageCouldNotBeRead")
      );
    },
  })
);
