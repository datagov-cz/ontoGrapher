import { AppSettings } from "../config/Variables";
import { CacheSearchVocabularies } from "../datatypes/CacheSearchResults";
import { initLanguageObject, parsePrefix } from "../function/FunctionEditVars";
import { processQuery } from "./TransactionInterface";

export async function standaloneGetVocabularies(): Promise<boolean> {
  const query = [
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "PREFIX a-popis-dat-pojem: <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/>",
    "SELECT ?vocabularyGraph ?vocabulary ?scheme ?title ?namespace ?diagram where {",
    "graph ?vocabularyGraph {",
    "OPTIONAL {?vocabulary <http://purl.org/vocab/vann/preferredNamespaceUri> ?namespace.}",
    "OPTIONAL {?vocabulary ?hasAttachmentPredicate ?diagram.",
    `VALUES ?hasAttachmentPredicate {<${[
      parsePrefix("a-popis-dat-pojem", "má-přílohu"),
      parsePrefix("d-sgov-pracovní-prostor-pojem", "má-přílohu"),
    ].join("> <")}>}}`,
    "?vocabulary a-popis-dat-pojem:má-glosář ?scheme.",
    "?vocabulary a a-popis-dat-pojem:slovník.",
    "?vocabulary <http://purl.org/dc/terms/title> ?title.",
    "}}",
  ].join(`
  `);
  return await processQuery(AppSettings.contextEndpoint, query)
    .then((response) => response.json())
    .then((data) => {
      if (data.results.bindings.length === 0) return false;
      for (const row of data.results.bindings) {
        if (!(row.vocabulary.value in CacheSearchVocabularies)) {
          CacheSearchVocabularies[row.vocabulary.value] = {
            labels: initLanguageObject(""),
            namespace: row.namespace ? row.namespace.value : "",
            glossary: row.scheme.value,
            diagrams: [],
            graph: row.vocabularyGraph.value,
          };
        }
        if (
          row.diagram &&
          !CacheSearchVocabularies[row.vocabulary.value].diagrams.includes(
            row.diagram.value
          )
        )
          CacheSearchVocabularies[row.vocabulary.value].diagrams.push(
            row.diagram.value
          );
        CacheSearchVocabularies[row.vocabulary.value].labels[
          row.title["xml:lang"]
        ] = row.title.value;
      }
      AppSettings.contextIRIs = Object.keys(CacheSearchVocabularies);
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}
