import * as _ from "lodash";
import { LinkType } from "../../config/Enum";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import { addDiagram } from "../../function/FunctionCreateVars";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import { processQuery } from "../../interface/TransactionInterface";
import { qb } from "../QueryBuilder";
import { WorkspaceLinks } from "./../../config/Variables";

//TODO: hot
export async function getElementsConfig(
  contextEndpoint: string = AppSettings.contextEndpoint,
  contexts: string[] = AppSettings.contextIRIs
): Promise<boolean> {
  const elements: {
    [key: string]: {
      active: boolean;
      diagramPosition: { [key: string]: { x: number; y: number } };
      hidden: { [key: string]: boolean };
      selectedName: { [key: string]: string };
      scheme: string;
      vocabulary?: string;
    };
  } = {};
  const appContextQuery = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "select ?elem ?scheme ?active ?name ?vocabulary where {",
    "graph ?graph {",
    "?elem a og:element .",
    "optional {?elem og:name ?name.}",
    "optional {?elem og:vocabulary ?vocabulary.}",
    "?elem og:scheme ?scheme .",
    "}",
    `?contextIRI ${qb.i(
      parsePrefix(
        "d-sgov-pracovní-prostor-pojem",
        `odkazuje-na-přílohový-kontext`
      )
    )} ?graph.`,
    `values ?contextIRI {<${contexts.join("> <")}>}`,
    "}",
  ].join(`
  `);
  const appContextElementRetrieval = await processQuery(
    contextEndpoint,
    appContextQuery
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (const result of data.results.bindings) {
        const iri = result.elem.value;
        if (!(iri in elements)) {
          elements[iri] = {
            active: true,
            diagramPosition: {},
            hidden: {},
            selectedName: initLanguageObject(""),
            scheme: result.scheme.value,
          };
        }
        if (
          result.name &&
          result.name.value &&
          !elements[iri].selectedName[result.name["xml:lang"]]
        )
          elements[iri].selectedName[result.name["xml:lang"]] =
            result.name.value;
        if (result.vocabulary)
          elements[iri].vocabulary = result.vocabulary.value;
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
  if (!appContextElementRetrieval) return false;
  else {
    const diagramContextQuery = [
      "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
      "select ?diagramID ?iri ?posX ?posY ?hidden where {",
      "graph ?graph {",
      "?iri og:position-x ?posX.",
      "?iri og:position-y ?posY.",
      "?iri og:hidden ?hidden.",
      "?diagram og:id ?diagramID.",
      // Make sure it is really a diagram we are querying
      "?diagram og:representation ?representation .",
      "}",
      `?contextIRI ${qb.i(
        parsePrefix(
          "d-sgov-pracovní-prostor-pojem",
          `odkazuje-na-přílohový-kontext`
        )
      )} ?graph.`,
      `values ?contextIRI {<${contexts.join("> <")}>}`,
      "}",
    ].join(`
    `);
    const diagramContextElementRetrieval = await processQuery(
      contextEndpoint,
      diagramContextQuery
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        for (const result of data.results.bindings) {
          const iri = result.iri.value;
          if (iri in elements) {
            if (!(result.diagramID.value in elements[iri].hidden)) {
              elements[iri].diagramPosition[result.diagramID.value] = {
                x: parseInt(result.posX.value),
                y: parseInt(result.posY.value),
              };
              elements[iri].hidden[result.diagramID.value] =
                result.hidden.value === "true";
            }
          }
        }
        return true;
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
    if (!diagramContextElementRetrieval) return false;
    else {
      for (const iri in elements) {
        if (
          !Object.keys(WorkspaceVocabularies)
            .map((vocab) => WorkspaceVocabularies[vocab].glossary)
            .includes(elements[iri].scheme)
        ) {
          const vocab = Object.keys(CacheSearchVocabularies).find(
            (vocab) =>
              CacheSearchVocabularies[vocab].glossary === elements[iri].scheme
          );
          if (vocab) {
            WorkspaceVocabularies[vocab] = {
              labels: CacheSearchVocabularies[vocab].labels,
              readOnly: true,
              namespace: CacheSearchVocabularies[vocab].namespace,
              graph: vocab,
              color: "#FFF",
              glossary: CacheSearchVocabularies[vocab].glossary,
            };
          }
        }
        WorkspaceElements[iri] = {
          hidden: elements[iri].hidden,
          position: elements[iri].diagramPosition,
          active: elements[iri].active,
          selectedLabel: elements[iri].selectedName,
          connectionsFrom: [],
          connectionsTo: [],
        };
      }
    }
    return true;
  }
}

export async function getSettings(contextEndpoint: string): Promise<boolean> {
  const query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select distinct ?open ?vocabContext ?graph ?diagram ?index ?name ?id ?representation ?vocabulary ?description ?collaborator ?creationDate ?modifyDate where {",
    "optional {?vocabContext <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-přílohový-kontext> ?graph .",
    "graph ?graph {",
    " ?diagram og:index ?index .",
    " ?diagram og:name ?name .",
    " ?diagram og:id ?id .",
    " ?diagram og:representation ?representation .",
    " optional {?diagram og:open ?open.}",
    " optional {?diagram og:description ?description.}",
    " optional {?diagram og:vocabulary ?vocabulary. ",
    "           ?diagram og:collaborator ?collaborator. ",
    "           ?diagram og:creationDate ?creationDate. ",
    "           ?diagram og:modifiedDate ?modifyDate. ",
    " }",
    "}",
    "}",
    `values ?vocabContext {<${AppSettings.contextIRIs.join("> <")}>}`,
    "} order by asc(?index)",
  ].join(`
  `);
  return await processQuery(contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const indices: number[] = [];
      const contextInfo: {
        [key: string]: string[];
      } = {};
      AppSettings.contextIRIs.forEach(
        (contextIRI) => (contextInfo[contextIRI] = [])
      );
      for (const result of data.results.bindings) {
        if (
          result.vocabContext &&
          !contextInfo[result.vocabContext.value].includes(result.graph.value)
        )
          contextInfo[result.vocabContext.value].push(result.graph.value);
        if (result.id && !(result.id.value in Diagrams)) {
          let index = parseInt(result.index.value);
          while (indices.includes(index)) index++;
          addDiagram(
            result.name.value,
            false,
            parseInt(result.representation.value, 10),
            index,
            result.diagram.value,
            result.id.value,
            result.graph.value
          );
          Diagrams[result.id.value].collaborators = [];
          Diagrams[result.id.value].saved = true;
          indices.push(index);
        }
        if (result.open) {
          Diagrams[result.id.value].open = result.open.value === "true";
        }
        if (result.description) {
          Diagrams[result.id.value].description = result.description.value;
        }
        if (result.vocabulary) {
          Diagrams[result.id.value].vocabularies = _.uniq([
            ...Diagrams[result.id.value].vocabularies,
            result.vocabulary.value,
          ]);
        }
        if (result.collaborator) {
          Diagrams[result.id.value].collaborators = _.uniq([
            ...Diagrams[result.id.value].collaborators,
            result.collaborator.value.replace(
              "https://slovník.gov.cz/uživatel/",
              ""
            ),
          ]);
        }
        if (result.creationDate) {
          Diagrams[result.id.value].creationDate = new Date(
            result.creationDate.value
          );
        }
        if (result.modifyDate) {
          Diagrams[result.id.value].modifiedDate = new Date(
            result.modifyDate.value
          );
        }
      }
      Object.entries(Diagrams).forEach(([key, value]) => {
        if (!indices.includes(value.index)) Diagrams[key].toBeDeleted = true;
        if (value.vocabularies.length === 0)
          Diagrams[key].vocabularies = Object.keys(
            WorkspaceVocabularies
          ).filter((v) => !WorkspaceVocabularies[v].readOnly);
      });
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}

//TODO: hot
export async function getLinksConfig(
  contextEndpoint: string = AppSettings.contextEndpoint,
  contexts: string[] = AppSettings.contextIRIs
): Promise<
  [Partial<typeof WorkspaceElements[0]>, Partial<typeof WorkspaceLinks[0]>]
> {
  const query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?id ?iri ?sourceID ?targetID ?active ?sourceCard1 ?sourceCard2 ?targetCard1 ?targetCard2 ?type ?link where {",
    "graph ?graph {",
    "?link a og:link .",
    "?link og:id ?id .",
    "?link og:iri ?iri .",
    "?link og:source ?sourceID .",
    "?link og:target ?targetID .",
    "?link og:type ?type .",
    "}",
    `?contextIRI <${parsePrefix(
      "d-sgov-pracovní-prostor-pojem",
      "odkazuje-na-přílohový-kontext"
    )}> ?graph.`,
    `values ?contextIRI {<${contexts.join("> <")}>}`,
    "} order by ?id",
  ].join(`
  `);
  const partialWorkspaceLinks: {
    [key: string]: Partial<typeof WorkspaceLinks[0]>;
  } = {};
  const partialWorkspaceElements: {
    [key: string]: Partial<typeof WorkspaceElements[0]>;
  } = {};
  await processQuery(contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (const result of data.results.bindings) {
        partialWorkspaceLinks[result.id.value] = {
          iri: result.iri.value,
          target: result.targetID.value,
          source: result.sourceID.value,
          active: true,
          vertices: {},
          type:
            result.type.value === "default"
              ? LinkType.DEFAULT
              : LinkType.GENERALIZATION,
          linkIRI: result.link.value,
        };
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
  const diagramContextQuery = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?diagram ?diagramID ?index ?posX ?posY ?id where {",
    "graph ?graph {",
    "?link a og:link.",
    "?link og:vertex ?vertex.",
    "?link og:id ?id.",
    "?vertex og:index ?index.",
    "?vertex og:position-x ?posX.",
    "?vertex og:position-y ?posY.",
    "?diagram og:id ?diagramID.",
    "?diagram og:representation ?representation.",
    "}",
    `?contextIRI <${parsePrefix(
      "d-sgov-pracovní-prostor-pojem",
      "odkazuje-na-přílohový-kontext"
    )}> ?graph.`,
    `values ?contextIRI {<${contexts.join("> <")}>}`,
    "}",
  ].join(`
    `);
  await processQuery(contextEndpoint, diagramContextQuery)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (const result of data.results.bindings) {
        const id = result.id.value;
        if (!(id in partialWorkspaceLinks)) continue;
        else {
          if (!(result.diagramID.value in partialWorkspaceLinks[id].vertices))
            partialWorkspaceLinks[id].vertices[result.diagramID.value] = [];
          partialWorkspaceLinks[id].vertices[result.diagramID.value][
            parseInt(result.index.value)
          ] = {
            x: parseInt(result.posX.value),
            y: parseInt(result.posY.value),
          };
        }
      }
    })
    .catch((e) => {
      console.error(e);
    });
}
