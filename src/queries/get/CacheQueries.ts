import { processQuery } from "../../interface/TransactionInterface";
import {
  CacheSearchResults,
  CacheSearchVocabularies,
} from "../../datatypes/CacheSearchResults";
import { initLanguageObject } from "../../function/FunctionEditVars";
import {
  AppSettings,
  Links,
  PackageRoot,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { RestrictionConfig } from "../../config/logic/RestrictionConfig";
import { createRestriction } from "../../function/FunctionRestriction";
import { LinkType } from "../../config/Enum";
import { setSchemeColors } from "../../function/FunctionGetVars";
import { PackageNode } from "../../datatypes/PackageNode";

export async function fetchVocabularies(
  endpoint: string,
  context: string
): Promise<boolean> {
  const query = [
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "SELECT ?vocabulary ?scheme ?title ?namespace ?term where {",
    "graph <" + context + "> {",
    "<" +
      context +
      "> <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-kontext> ?vocabulary.}",
    "graph ?vocabulary {",
    "?vocabulary <http://purl.org/vocab/vann/preferredNamespaceUri> ?namespace.",
    "?vocabulary <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-glosář> ?scheme.",
    "?vocabulary <http://purl.org/dc/terms/title> ?title.",
    "?term skos:inScheme ?scheme.",
    "}}",
  ].join(" ");
  const count: { [key: string]: string[] } = {};
  return await processQuery(endpoint, query)
    .then((response) => response.json())
    .then((data) => {
      if (data.results.bindings.length === 0) return false;
      for (const row of data.results.bindings) {
        if (!(row.vocabulary.value in CacheSearchVocabularies)) {
          CacheSearchVocabularies[row.vocabulary.value] = {
            labels: initLanguageObject(""),
            namespace: row.namespace.value,
            glossary: row.scheme.value,
            count: 0,
          };
          count[row.vocabulary.value] = [];
        }
        CacheSearchVocabularies[row.vocabulary.value].labels[
          row.title["xml:lang"]
        ] = row.title.value;
        if (!count[row.vocabulary.value].includes(row.term.value))
          count[row.vocabulary.value].push(row.term.value);
      }
      for (const vocab in count) {
        CacheSearchVocabularies[vocab].count = count[vocab].length;
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}

export async function fetchRelationships(
  endpoint: string,
  terms: string[]
): Promise<boolean> {
  for (let i = 0; i < Math.ceil(terms.length / 25); i++) {
    const termSlice = terms.slice(i * 25, (i + 1) * 25);
    const query = [
      "SELECT ?term ?restriction ?restrictionPred ?target ?onProperty ?onClass WHERE {",
      "graph <" + AppSettings.cacheContext + "> {",
      "?term rdfs:subClassOf ?restriction.",
      "?restriction a owl:Restriction.",
      "?restriction owl:onProperty ?onProperty.",
      "values ?onProperty {<" + Object.keys(Links).join("> <") + ">}",
      "?restriction ?restrictionPred ?target.",
      "values ?restrictionPred {<" +
      Object.keys(RestrictionConfig).join("> <") +
      ">}",
      "values ?target {<" + termSlice.join("> <") + ">}",
      "optional {?restriction owl:onClass ?onClass.}",
      "}}"
    ].join(" ");
    await processQuery(endpoint, query)
      .then((response) => response.json())
      .then((data) => {
        for (const row of data.results.bindings) {
          if (row.term.value in WorkspaceTerms) {
            createRestriction(
              WorkspaceTerms[row.term.value].restrictions,
              row.term.value,
              row.restrictionPred.value,
              row.onProperty.value,
              row.target,
              row.onClass ? row.onClass.value : undefined
            );
          }
        }
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
  }
  return true;
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
    "con:query \"" + term + "\" ;",
    "con:entities ?entity .",
    "?entity skos:prefLabel ?label.",
    "optional {?entity skos:definition ?definition.}",
    "?entity skos:inScheme ?scheme.",
    "?vocabulary <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-glosář> ?scheme.",
    limitToVocabularies && limitToVocabularies.length > 0
      ? "VALUES ?vocabulary {<" + limitToVocabularies.join("> <") + ">}"
      : "",
    "}"
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

export async function fetchReadOnlyTerms(
  contextEndpoint: string,
  terms: string[]
): Promise<boolean> {
  const result: {
    [key: string]: {
      labels: { [key: string]: string };
      definitions: { [key: string]: string };
      altLabels: { label: string; language: string }[];
      types: string[];
      inScheme: string;
      domain?: string;
      range?: string;
      subClassOf: string[];
      restrictions: [];
      type: number;
      topConcept?: string;
      character?: string;
      inverseOf?: string;
    };
  } = {};
  for (let i = 0; i < Math.ceil(terms.length / 25); i++) {
    const termSlice = terms.slice(i * 25, (i + 1) * 25);
    const query = [
      "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
      "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
      "PREFIX dct: <http://purl.org/dc/terms/>",
      "SELECT DISTINCT ?term ?termLabel ?termAltLabel ?termType ?termDefinition ?termDomain ?termRange ?topConcept ?restriction ?restrictionPred ?onProperty ?onClass ?target ?subClassOf ?scheme",
      "WHERE {",
      "GRAPH ?graph {",
      "?term skos:inScheme ?scheme.",
      "OPTIONAL {?term a ?termType.}",
      "VALUES ?term {<" + termSlice.join("> <") + ">}",
      "OPTIONAL {?term skos:prefLabel ?termLabel.}",
      "OPTIONAL {?term skos:altLabel ?termAltLabel.}",
      "OPTIONAL {?term skos:definition ?termDefinition.}",
      "OPTIONAL {?term rdfs:domain ?termDomain.}",
      "OPTIONAL {?term rdfs:range ?termRange.}",
      "OPTIONAL {?term rdfs:subClassOf ?subClassOf. ",
      "filter (!isBlank(?subClassOf)) }",
      "OPTIONAL {?topConcept skos:hasTopConcept ?term. }",
      "OPTIONAL {?term rdfs:subClassOf ?restriction. ",
      "?restriction a owl:Restriction .",
      "?restriction owl:onProperty ?onProperty.",
      "OPTIONAL {?restriction owl:onClass ?onClass.}",
      "?restriction ?restrictionPred ?target.",
      "filter (?restrictionPred in (<" +
      Object.keys(RestrictionConfig).join(">, <") +
      ">))}}",
      "<" +
      AppSettings.cacheContext +
      "> <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-kontext> ?graph.",
      "}"
    ].join(" ");
    await processQuery(contextEndpoint, query)
      .then((response) => response.json())
      .then((data) => {
        for (const row of data.results.bindings) {
          if (!(row.term.value in result)) {
            result[row.term.value] = {
              labels: initLanguageObject(""),
              definitions: initLanguageObject(""),
              altLabels: [],
              types: [],
              inScheme: row.scheme.value,
              subClassOf: [],
              restrictions: [],
              type: LinkType.DEFAULT
            };
          }
          if (
            row.termType &&
            !result[row.term.value].types.includes(row.termType.value)
          )
            result[row.term.value].types.push(row.termType.value);
          if (row.termLabel) {
            if (!(row.termLabel["xml:lang"] in result[row.term.value].labels))
              result[row.term.value].labels[row.termLabel["xml:lang"]] = "";
            result[row.term.value].labels[row.termLabel["xml:lang"]] =
              row.termLabel.value;
          }
          if (row.termAltLabel) {
            if (
              !result[row.term.value].altLabels.find(
                (alt: { label: string; language: string }) =>
                  alt.label === row.termAltLabel.value &&
                  alt.language === row.termAltLabel["xml:lang"]
              )
            )
              result[row.term.value].altLabels.push({
                label: row.termAltLabel.value,
                language: row.termAltLabel["xml:ang"]
              });
          }
          if (row.termDefinition) {
            if (
              !(
                row.termDefinition["xml:lang"] in
                result[row.term.value].definitions
              )
            )
              result[row.term.value].definitions[
                row.termDefinition["xml:lang"]
                ] = "";
            result[row.term.value].definitions[row.termDefinition["xml:lang"]] =
              row.termDefinition.value;
          }
          if (row.termDomain)
            result[row.term.value].domain = row.termDomain.value;
          if (row.termRange) result[row.term.value].range = row.termRange.value;
          if (row.character)
            result[row.term.value].character = row.character.value;
          if (row.topConcept)
            result[row.term.value].topConcept = row.topConcept.value;
          if (
            row.subClassOf &&
            row.subClassOf.type !== "bnode" &&
            !result[row.term.value].subClassOf.includes(row.subClassOf.value)
          )
            result[row.term.value].subClassOf.push(row.subClassOf.value);
          if (
            row.restriction &&
            Object.keys(Links).includes(row.onProperty.value)
          )
            createRestriction(
              result[row.term.value].restrictions,
              row.term.value,
              row.restrictionPred.value,
              row.onProperty.value,
              row.target,
              row.onClass ? row.onClass.value : undefined
            );
          if (row.inverseOf)
            result[row.term.value].inverseOf = row.inverseOf.value;
          const vocab = Object.keys(CacheSearchVocabularies).find(
            (vocab) =>
              CacheSearchVocabularies[vocab].glossary === row.scheme.value
          );
          if (
            !Object.keys(WorkspaceVocabularies).find(
              (vocab) =>
                WorkspaceVocabularies[vocab].glossary === row.scheme.value
            )
          ) {
            if (vocab) {
              WorkspaceVocabularies[vocab] = {
                labels: CacheSearchVocabularies[vocab].labels,
                readOnly: true,
                namespace: CacheSearchVocabularies[vocab].namespace,
                glossary: CacheSearchVocabularies[vocab].glossary,
                graph: vocab,
                color: "#FFF",
                count: 0
              };
              new PackageNode(
                CacheSearchVocabularies[vocab].labels,
                PackageRoot,
                false,
                row.scheme.value
              );
              setSchemeColors(AppSettings.viewColorPool);
            }
          }
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
  Object.assign(WorkspaceTerms, result);
  for (const term in result) {
    const vocab = Object.keys(WorkspaceVocabularies).find(
      (vocab) =>
        WorkspaceVocabularies[vocab].glossary === WorkspaceTerms[term].inScheme
    );
    if (vocab) {
      WorkspaceVocabularies[vocab].count++;
    }
  }
  return true;
}
