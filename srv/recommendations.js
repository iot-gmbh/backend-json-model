const { Vector } = require("vector-object");
const { TfIdf } = require("natural");

/* Inspired by: https://dev.to/jimatjibba/build-a-content-based-recommendation-engine-in-js-2lpi */

const formatData = (data) => {
  const formatted = Object.entries(data).map(([key, labels]) => {
    const desc = labels.map((l) => l.description.toLowerCase());

    return {
      id: key,
      content: desc.join(" "),
    };
  });
  return formatted;
};

/**
 * Generates the TF-IDF of each term in the document
 * Create a Vector with the term as the key and the TF-IDF as the value
 * @example - example vector
 * {
 *   flowers: 1.2345
 * }
 */
const createVectorsFromDocs = (processedDocs) => {
  const tfidf = new TfIdf();

  processedDocs.forEach((processedDocument) => {
    tfidf.addDocument(processedDocument.content);
  });

  const documentVectors = [];

  for (let i = 0; i < processedDocs.length; i += 1) {
    const processedDocument = processedDocs[i];
    const obj = {};

    const items = tfidf.listTerms(i);

    for (let j = 0; j < items.length; j += 1) {
      const item = items[j];
      obj[item.term] = item.tfidf;
    }

    const documentVector = {
      id: processedDocument.id,
      vector: new Vector(obj),
    };

    documentVectors.push(documentVector);
  }

  return documentVectors;
};

const getSimilarDocuments = (id, trainedData) => {
  const similarDocuments = trainedData[id];

  if (similarDocuments === undefined) {
    return [];
  }

  return similarDocuments;
};

module.exports = getSimilarDocuments;
