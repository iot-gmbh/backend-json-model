function extractErrorMsgFromXML(error) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(error, "text/xml");
  return xmlDoc
    .getElementsByTagName("error")[0]
    .getElementsByTagName("message")[0].childNodes[0].wholeText;
}

function extractErrorMsgFromJSON(error) {
  const responseText = JSON.parse(error.responseText);
  const message =
    responseText.error.message.value || "The error could not be parsed.";

  return message;
}

function parseError(error) {
  const bundle = sap.ui.getCore().getLibraryResourceBundle("barcodescanner");

  try {
    if (!error.responseText && error.message) return error.message;
    return extractErrorMsgFromJSON(error);
  } catch (errJSON) {
    try {
      return extractErrorMsgFromXML(error);
    } catch (errXML) {
      return bundle.getText("errorMessageCouldNotBeParsed");
    }
  }
}

sap.ui.define([], () => ({
  parse(error) {
    const message = parseError(error);
    const formattedMessage = message.replace(/(\d+)/gi, "<strong>$1</strong>");
    return formattedMessage;
  },
}));
