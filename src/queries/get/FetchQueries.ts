import {
  AppSettings,
  Prefixes,
  Users,
  EquivalentClasses,
} from "./../../config/Variables";
import { LinkType } from "../../config/Enum";
import { RestrictionConfig } from "../../config/logic/RestrictionConfig";
import {
  Links,
  Stereotypes,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { Restriction } from "../../datatypes/Restriction";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import { createRestriction } from "../../function/FunctionRestriction";
import { processQuery } from "../../interface/TransactionInterface";
import { qb } from "../QueryBuilder";
import * as _ from "lodash";

function pushEquivalentClass(iri: string, equivalent: string) {
  const push = (iri: string, equivalent: string) =>
    _.flatten(_.compact([EquivalentClasses[iri], iri, equivalent]));
  EquivalentClasses[iri] = push(iri, equivalent);
  EquivalentClasses[equivalent] = push(equivalent, iri);
  for (const eq of EquivalentClasses[equivalent]) push(eq, equivalent);
  for (const eq of EquivalentClasses[iri]) push(eq, iri);
}

/**
 * Gets vocabulary info.
 * @param iris The scheme IRIs to query
 * @param readOnly Write status of vocabulary
 * @param endpoint SPARQL endpoint
 * @param scheme Whether to filter for schemes or vocabularies
 */
export async function fetchVocabulary(
  iris: string[],
  readOnly: boolean,
  endpoint: string,
  scheme: boolean = true
): Promise<boolean> {
  const query = [
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "PREFIX dct: <http://purl.org/dc/terms/>",
    "SELECT DISTINCT ?vocabulary ?scheme ?namespace ?schemeTitle ?vocabTitle",
    "WHERE {",
    "OPTIONAL {?scheme dct:title ?schemeTitle.}",
    "OPTIONAL {?vocabulary <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-glosář> ?scheme.",
    "?vocabulary dct:title ?vocabTitle.",
    "OPTIONAL {?vocabulary <http://purl.org/vocab/vann/preferredNamespaceUri> ?namespace. }}",
    "values " +
      (scheme ? "?scheme" : "?vocabulary") +
      " {<" +
      iris.join("> <") +
      ">}",
    "}",
  ].join(" ");
  return await processQuery(endpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.results.bindings.length === 0) return false;
      for (const result of data.results.bindings) {
        if (result.scheme) {
          const iri = result.vocabulary
            ? result.vocabulary.value
            : result.scheme.value;
          if (!(iri in WorkspaceVocabularies))
            WorkspaceVocabularies[iri] = {
              labels: {},
              readOnly: readOnly,
              namespace: "",
              graph: "",
              glossary: result.scheme.value,
              color: "#FFF",
            };
          if (result.vocabTitle)
            WorkspaceVocabularies[iri].labels[result.vocabTitle["xml:lang"]] =
              result.vocabTitle.value;
          else if (result.schemeTitle)
            WorkspaceVocabularies[iri].labels[result.schemeTitle["xml:lang"]] =
              result.schemeTitle.value;
          if (result.namespace)
            WorkspaceVocabularies[iri].namespace = result.namespace.value;
        }
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}

export async function fetchBaseOntology(
  endpoint: string,
  scheme: string,
  sendTo: { [key: string]: any },
  requiredTypes?: string[],
  requiredValues?: string[]
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
      restrictions: Restriction[];
      type: number;
      topConcept?: string;
      character?: string;
      inverseOf?: string;
    };
  } = {};
  const query = [
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "PREFIX z-sgov-pojem: <https://slovník.gov.cz/základní/pojem/>",
    "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
    "SELECT ?term ?termLabel ?termAltLabel ?termType ?termDefinition ?termDomain ?termRange ?inverseOf ?character ?subClassOf ?equivalent",
    "WHERE {",
    "?term skos:inScheme <" + scheme + ">.",
    requiredTypes && "VALUES ?termType {<" + requiredTypes.join("> <") + ">}",
    requiredValues && "VALUES ?term {<" + requiredValues.join("> <") + ">}",
    "?term skos:prefLabel ?termLabel.",
    "?term a ?termType.",
    "OPTIONAL {?term skos:altLabel ?termAltLabel.}",
    "OPTIONAL {?equivalent owl:equivalentClass ?term.}",
    "OPTIONAL {?term skos:definition ?termDefinition.}",
    "OPTIONAL {?term z-sgov-pojem:charakterizuje ?character.}",
    "OPTIONAL {?term rdfs:domain ?termDomain.}",
    "OPTIONAL {?term rdfs:range ?termRange.}",
    "OPTIONAL {?term rdfs:subClassOf ?subClassOf. ",
    "filter (!isBlank(?subClassOf)) }",
    "OPTIONAL {?term owl:inverseOf ?inverseOf. ",
    "filter (!isBlank(?inverseOf)) }",
    "}",
  ].join(`
  `);
  return await processQuery(endpoint, query)
    .then((response) => response.json())
    .then((data) => {
      if (data.results.bindings.length === 0) return false;
      for (const row of data.results.bindings) {
        if (!(row.term.value in result)) {
          result[row.term.value] = {
            labels: initLanguageObject(""),
            definitions: initLanguageObject(""),
            altLabels: [],
            types: [],
            inScheme: scheme,
            subClassOf: [],
            restrictions: [],
            type: LinkType.DEFAULT,
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
              language: row.termAltLabel["xml:lang"],
            });
        }
        if (row.termDefinition) {
          if (
            !(
              row.termDefinition["xml:lang"] in
              result[row.term.value].definitions
            )
          )
            result[row.term.value].definitions[row.termDefinition["xml:lang"]] =
              "";
          result[row.term.value].definitions[row.termDefinition["xml:lang"]] =
            row.termDefinition.value;
        }
        if (row.termDomain)
          result[row.term.value].domain = row.termDomain.value;
        if (row.termRange) result[row.term.value].range = row.termRange.value;
        if (row.character)
          result[row.term.value].character = row.character.value;
        if (
          row.subClassOf &&
          row.subClassOf.type !== "bnode" &&
          !result[row.term.value].subClassOf.includes(row.subClassOf.value)
        )
          result[row.term.value].subClassOf.push(row.subClassOf.value);
        if (row.inverseOf)
          result[row.term.value].inverseOf = row.inverseOf.value;
        if (row.equivalent)
          pushEquivalentClass(row.term.value, row.equivalent.value);
      }
      Object.keys(EquivalentClasses).forEach(
        (e) => (EquivalentClasses[e] = _.uniq(EquivalentClasses[e]))
      );
      Object.assign(sendTo, result);
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}

export async function fetchRestrictions(
  endpoint: string,
  terms: { [key: string]: any },
  scheme?: string,
  vocabulary?: string,
  graph?: string,
  targets?: string[]
): Promise<{ [key: string]: { restrictions: Restriction[] } }> {
  const result: {
    [key: string]: {
      restrictions: Restriction[];
    };
  } = Object.fromEntries(
    Object.keys(terms).map((k) => [k, { restrictions: [] }])
  );

  const query = [
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "PREFIX z-sgov-pojem: <https://slovník.gov.cz/základní/pojem/>",
    "SELECT ?term ?inverseOnProperty ?restrictionPred ?onProperty ?onClass ?target",
    "WHERE {",
    graph && "GRAPH <" + graph + "> {",
    vocabulary
      ? [
          "?term skos:inScheme ?scheme.",
          "<" +
            vocabulary +
            "> <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-glosář> ?scheme.",
        ].join(" ")
      : "?term skos:inScheme <" + scheme + ">.",
    "?term rdfs:subClassOf ?restriction. ",
    "?restriction a owl:Restriction .",
    "OPTIONAL {?restriction owl:onProperty ?onProperty.",
    "FILTER (!isBlank(?onProperty))}",
    "OPTIONAL {?restriction owl:onProperty [owl:inverseOf ?inverseOnProperty].}",
    "OPTIONAL {?restriction owl:onClass ?onClass.}",
    "FILTER(bound(?onProperty) || bound(?inverseOnProperty))",
    "?restriction ?restrictionPred ?target.",
    targets ? "values ?target {<" + targets.join("> <") + ">}" : "",
    "FILTER (!isBlank(?target))",
    "values ?restrictionPred {<" +
      Object.keys(RestrictionConfig).join("> <") +
      ">}",
    "}",
    graph && "}",
  ].join(" ");
  return await processQuery(endpoint, query)
    .then((response) => response.json())
    .then((data) => {
      const restrictions: Restriction[] = [];
      for (const row of data.results.bindings) {
        if (!(row.term.value in result)) continue;
        restrictions.push(
          new Restriction(
            row.term.value,
            row.restrictionPred.value,
            !!row.onProperty
              ? row.onProperty.value
              : row.inverseOnProperty.value,
            row.target.value,
            row.onClass ? row.onClass.value : undefined,
            !row.onProperty
          )
        );
      }
      for (const restriction of restrictions.filter(
        (r) => Object.keys(Links).includes(r.onProperty) && r.source in result
      )) {
        createRestriction(restriction, result[restriction.source].restrictions);
      }
      return result;
    })
    .catch((e) => {
      console.error(e);
      return {};
    });
}

export async function fetchTerms(
  endpoint: string,
  scheme?: string,
  vocabulary?: string,
  graph?: string,
  terms?: string[]
): Promise<typeof WorkspaceTerms> {
  const result: typeof WorkspaceTerms = {};
  const query = [
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "PREFIX z-sgov-pojem: <https://slovník.gov.cz/základní/pojem/>",
    "SELECT ?term ?termLabel ?termAltLabel ?termType ?termDefinition ?topConcept ?subClassOf",
    "WHERE {",
    graph && "GRAPH <" + graph + "> {",
    vocabulary
      ? [
          "?term skos:inScheme ?scheme.",
          "<" +
            vocabulary +
            "> <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-glosář> ?scheme.",
        ].join(" ")
      : "?term skos:inScheme <" + scheme + ">.",
    "?term a ?termType.",
    terms ? "values ?term {<" + terms.join("> <") + ">}" : "",
    "?term skos:prefLabel ?termLabel.",
    scheme && "?term skos:inScheme ?scheme",
    "OPTIONAL {?term skos:altLabel ?termAltLabel.}",
    "OPTIONAL {?term skos:definition ?termDefinition.}",
    "OPTIONAL {?term rdfs:subClassOf ?subClassOf. ",
    "filter (!isBlank(?subClassOf)) }",
    "OPTIONAL {?topConcept skos:hasTopConcept ?term. }",
    "}",
    graph && "}",
  ].join(" ");
  return await processQuery(endpoint, query)
    .then((response) => response.json())
    .then((data) => {
      for (const row of data.results.bindings) {
        if (!(row.term.value in result)) {
          result[row.term.value] = {
            topConcept: undefined,
            labels: initLanguageObject(""),
            definitions: initLanguageObject(""),
            altLabels: [],
            types: [],
            inScheme: scheme ? scheme : row.scheme.value,
            subClassOf: [],
            restrictions: [],
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
              language: row.termAltLabel["xml:lang"],
            });
        }
        if (row.termDefinition) {
          if (
            !(
              row.termDefinition["xml:lang"] in
              result[row.term.value].definitions
            )
          )
            result[row.term.value].definitions[row.termDefinition["xml:lang"]] =
              "";
          result[row.term.value].definitions[row.termDefinition["xml:lang"]] =
            row.termDefinition.value;
        }
        if (row.topConcept)
          result[row.term.value].topConcept = row.topConcept.value;
        if (
          row.subClassOf &&
          row.subClassOf.type !== "bnode" &&
          !result[row.term.value].subClassOf.includes(row.subClassOf.value)
        )
          result[row.term.value].subClassOf.push(row.subClassOf.value);
      }
      return result;
    })
    .catch((e) => {
      console.error(e);
      return {};
    });
}

/**
 * Gets subclasses of terms and cardinality restrictions of terms which are on certain properties.
 * @param endpoint SPARQL endpoint
 * @param scheme skos:inScheme of the terms
 * @param stereotypeList List of term IRIs to query
 * @param linkList List of term IRIs to restrict the restriction onProperty search to
 */
export async function fetchSubClassesAndCardinalities(
  endpoint: string,
  scheme: string,
  stereotypeList: string[],
  linkList: string[]
): Promise<boolean> {
  let query = [
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
    "SELECT DISTINCT ?term ?subClass ?onProperty ?predicate ?object",
    "WHERE {",
    "?term rdfs:subClassOf+ ?subClass.",
    "values ?term {<" + stereotypeList.join("> <") + ">}",
    "?subClass skos:inScheme <" + scheme + ">.",
    "filter (!isBlank(?subClass)).",
    "OPTIONAL {",
    "?superClass rdfs:subClassOf ?restriction.",
    "?superClass skos:inScheme <" + scheme + ">.",
    "?restriction a owl:Restriction.",
    "?restriction owl:onClass ?subClass.",
    "?restriction owl:onProperty ?onProperty.",
    "?restriction ?predicate ?object.",
    "values ?predicate {owl:minQualifiedCardinality owl:maxQualifiedCardinality}",
    "values ?onProperty {<" + linkList.join("> <") + ">}",
    "}",
    "}",
  ].join(" ");
  return await processQuery(endpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (const result of data.results.bindings) {
        if (
          result.term.value in Stereotypes &&
          !Stereotypes[result.term.value].subClassOf.includes(
            result.subClass.value
          )
        )
          Stereotypes[result.term.value].subClassOf.push(result.subClass.value);
        if (result.onProperty && result.onProperty.value in Links) {
          const domain = Object.keys(Links).find(
            (link) => Links[link].domain === result.subClass.value
          );
          const range = Object.keys(Links).find(
            (link) => Links[link].range === result.subClass.value
          );
          if (domain) {
            result.predicate.value ===
            parsePrefix("owl", "minQualifiedCardinality")
              ? Links[domain].defaultSourceCardinality.setFirstCardinality(
                  result.object.value
                )
              : Links[domain].defaultSourceCardinality.setSecondCardinality(
                  result.object.value
                );
          }
          if (range) {
            result.predicate.value ===
            parsePrefix("owl", "minQualifiedCardinality")
              ? Links[range].defaultTargetCardinality.setFirstCardinality(
                  result.object.value
                )
              : Links[range].defaultTargetCardinality.setSecondCardinality(
                  result.object.value
                );
          }
        }
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}

export async function fetchUsers(...ids: string[]): Promise<boolean> {
  if (ids.length === 0) return false;
  function getUserID(iri: string): string {
    return iri.replaceAll("https://slovník.gov.cz/uživatel/", "");
  }
  const query = [
    `PREFIX a-popis-dat-pojem: ${qb.i(Prefixes["a-popis-dat-pojem"])}`,
    "select ?id ?first ?last where {",
    "?id a-popis-dat-pojem:má-křestní-jméno ?first.",
    "?id a-popis-dat-pojem:má-příjmení ?last.",
    `values ?id {<${ids.join("> <")}>}`,
    "}",
  ].join(`
  `);

  return await processQuery(AppSettings.contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (const result of data.results.bindings) {
        const id = getUserID(result.id.value);
        if (!(id in Users)) {
          Users[id] = {
            given_name: result.first.value,
            family_name: result.last.value,
          };
        }
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}
