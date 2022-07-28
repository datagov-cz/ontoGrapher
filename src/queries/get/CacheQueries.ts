import { processQuery } from "../../interface/TransactionInterface";
import {
  CacheSearchResults,
  CacheSearchVocabularies,
} from "../../datatypes/CacheSearchResults";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import { AppSettings } from "../../config/Variables";
import { Representation } from "../../config/Enum";
import _ from "lodash";
import { createCount } from "../../function/FunctionCreateVars";
import { RepresentationConfig } from "../../config/logic/RepresentationConfig";

export async function fetchVocabularies(
  endpoint: string,
  context: string
): Promise<boolean> {
  const query = [
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "SELECT ?vocabulary ?scheme ?title ?namespace ?term ?type ?diagram where {",
    "graph <" + context + "> {",
    "<" +
      context +
      "> <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-kontext> ?vocabulary.}",
    "graph ?vocabulary {",
    "OPTIONAL {?vocabulary <http://purl.org/vocab/vann/preferredNamespaceUri> ?namespace.}",
    "OPTIONAL {?vocabulary ?hasAttachmentPredicate ?diagram.",
    `VALUES ?hasAttachmentPredicate {<${[
      parsePrefix("a-popis-dat-pojem", "má-přílohu"),
      parsePrefix("d-sgov-pracovní-prostor-pojem", "má-přílohu"),
    ].join("> <")}>}}`,
    "?vocabulary <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-glosář> ?scheme.",
    "?vocabulary <http://purl.org/dc/terms/title> ?title.",
    "?term skos:inScheme ?scheme.",
    "?term a ?type.",
    "}}",
  ].join(" ");
  const count: { [key: string]: { [key: string]: string[] } } = {};
  return await processQuery(endpoint, query)
    .then((response) => response.json())
    .then((data) => {
      if (data.results.bindings.length === 0) return false;
      for (const row of data.results.bindings) {
        if (!(row.vocabulary.value in CacheSearchVocabularies)) {
          CacheSearchVocabularies[row.vocabulary.value] = {
            labels: initLanguageObject(""),
            namespace: row.namespace ? row.namespace.value : "",
            glossary: row.scheme.value,
            count: createCount(),
            diagrams: [],
          };
          count[row.vocabulary.value] = {};
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
        if (!(row.term.value in count[row.vocabulary.value])) {
          count[row.vocabulary.value][row.term.value] = [];
          CacheSearchVocabularies[row.vocabulary.value].count[
            Representation.FULL
          ]++;
        }
        if (
          RepresentationConfig[
            Representation.COMPACT
          ].visibleStereotypes.includes(row.type.value)
        )
          count[row.vocabulary.value][row.term.value].push(row.type.value);
      }
      Object.keys(count).forEach((vocab) => {
        CacheSearchVocabularies[vocab].count[Representation.COMPACT] =
          Object.keys(count[vocab]).filter(
            (term) => _.uniq(count[vocab][term]).length > 0
          ).length;
      });
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}

export async function fetchSubClasses(
  endpoint: string,
  term: string
): Promise<string[]> {
  const query = [
    "SELECT ?term WHERE {",
    "graph ?graph {",
    "?term rdfs:subClassOf ?subClass.",
    "values ?subClass {<" + term + ">}.",
    "}",
    "<" +
      AppSettings.cacheContext +
      "> <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-kontext> ?graph.",
    "}",
  ].join(" ");
  return await processQuery(endpoint, query)
    .then((response) => response.json())
    .then((data) => {
      const result: string[] = [];
      for (const row of data.results.bindings) {
        if (!result.includes(row.term.value)) {
          result.push(row.term.value);
        }
      }
      return result;
    })
    .catch((e) => {
      console.error(e);
      return [];
    });
}

export async function searchCache(
  endpoint: string,
  lucene: string,
  term: string,
  limitToVocabularies?: string[]
): Promise<CacheSearchResults> {
  if (
    !term &&
    ((limitToVocabularies && limitToVocabularies.length === 0) ||
      !limitToVocabularies)
  )
    return {};
  const query = [
    "PREFIX con: <http://www.ontotext.com/connectors/lucene#>",
    "PREFIX con-inst: <http://www.ontotext.com/connectors/lucene/instance#>",
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "SELECT ?entity ?label ?definition ?vocabulary {",
    "[] a con-inst:" + lucene + " ;",
    'con:query "' + term + '" ;',
    "con:entities ?entity .",
    "graph ?vocabulary {",
    "?entity skos:prefLabel ?label.",
    "optional {?entity skos:definition ?definition.}",
    "?entity skos:inScheme ?scheme.",
    "}",
    "?vocabulary <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-glosář> ?scheme.",
    "<" +
      AppSettings.cacheContext +
      "> <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-kontext> ?vocabulary.",
    limitToVocabularies && limitToVocabularies.length > 0
      ? "VALUES ?vocabulary {<" + limitToVocabularies.join("> <") + ">}"
      : "",
    "}",
  ].join(" ");
  return await processQuery(endpoint, query)
    .then((response) => response.json())
    .then((json) => {
      const result: CacheSearchResults = {};
      for (const row of json.results.bindings) {
        if (!(row.entity.value in result)) {
          result[row.entity.value] = {
            labels: initLanguageObject(""),
            altLabels: [],
            definitions: initLanguageObject(""),
            vocabulary: row.vocabulary.value,
          };
        }
        result[row.entity.value].labels[row.label["xml:lang"]] =
          row.label.value;
        if (row.definition)
          result[row.entity.value].definitions[row.definition["xml:lang"]] =
            row.definition.value;
      }
      return result;
    })
    .catch((e) => {
      console.error(e);
      return {};
    });
}

export async function fetchFullRelationships(
  contextEndpoint: string,
  term: string
): Promise<
  {
    relation: string;
    target: string;
    labels: { [key: string]: string };
  }[]
> {
  const query = [
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "select ?term2 ?label ?relation ?graph where {",
    "graph ?graph {",
    "values ?term {<" + term + ">}.",
    "?relation a <" + parsePrefix("z-sgov-pojem", "typ-vztahu") + ">.",
    "?relation rdfs:subClassOf ?restriction1.",
    "?relation rdfs:subClassOf ?restriction2.",
    "?relation skos:prefLabel ?label.",
    "filter(isBlank(?restriction1)).",
    "filter(isBlank(?restriction2)).",
    "?restriction1 a owl:Restriction.",
    "?restriction1 owl:someValuesFrom ?term.",
    "?restriction2 a owl:Restriction.",
    "?restriction2 owl:someValuesFrom ?term2.",
    "filter(?term != ?term2).",
    "}",
    "<" +
      AppSettings.cacheContext +
      "> <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-kontext> ?graph.",
    "}",
  ].join(" ");
  const relationships: {
    relation: string;
    target: string;
    labels: { [key: string]: string };
  }[] = [];
  return await processQuery(contextEndpoint, query)
    .then((response) => response.json())
    .then((data) => {
      for (const row of data.results.bindings) {
        let find = relationships.find(
          (conn) =>
            conn.relation === row.relation.value &&
            conn.target === row.term2.value
        );
        if (!find) {
          find = {
            relation: row.relation.value,
            target: row.term2.value,
            labels: initLanguageObject(""),
          };
          relationships.push(find);
        }
        find.labels[row.label["xml:lang"]] = row.label.value;
      }
      return relationships;
    })
    .catch((e) => {
      console.error(e);
      return [];
    });
}
