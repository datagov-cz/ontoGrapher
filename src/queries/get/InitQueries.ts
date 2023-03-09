import { ContextLoadingStrategy, LinkType } from "../../config/Enum";
import {
  AppSettings,
  Diagrams,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import { Cardinality } from "../../datatypes/Cardinality";
import { addDiagram } from "../../function/FunctionCreateVars";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import { processQuery } from "../../interface/TransactionInterface";
import { qb } from "../QueryBuilder";
import * as _ from "lodash";

export async function getElementsConfig(
  contextEndpoint: string
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
    "graph <" + AppSettings.applicationContext + "> {",
    "?elem a og:element .",
    "?elem og:active ?active .",
    "optional {?elem og:name ?name.}",
    "optional {?elem og:vocabulary ?vocabulary.}",
    "?elem og:scheme ?scheme .",
    "}}",
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
            active: result.active.value === "true",
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
      "select ?diagram ?graph ?diagramID ?iri ?posX ?posY ?hidden where {",
      "graph ?graph {",
      "?iri og:position-x ?posX.",
      "?iri og:position-y ?posY.",
      "?iri og:hidden ?hidden.",
      "?diagram og:id ?diagramID.",
      "?diagram og:representation ?representation .",
      "}",
      `?contextIRI ${qb.i(
        parsePrefix(
          "d-sgov-pracovní-prostor-pojem",
          `odkazuje-na-přílohový-kontext`
        )
      )} ?graph.`,
      `values ?contextIRI {<${AppSettings.contextIRIs.join("> <")}>}`,
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
        };
      }
    }
    return true;
  }
}

export async function getSettings(contextEndpoint: string): Promise<{
  strategy: ContextLoadingStrategy | undefined;
  contextsMissingAppContexts: string[];
  contextsMissingAttachments: string[];
}> {
  const ret: {
    strategy: ContextLoadingStrategy | undefined;
    contextsMissingAppContexts: string[];
    contextsMissingAttachments: string[];
  } = {
    strategy: undefined,
    contextsMissingAppContexts: [],
    contextsMissingAttachments: [],
  };
  const query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select distinct ?active ?vocabContext ?ogContext ?graph ?diagram ?index ?name ?color ?id ?representation ?context ?vocabulary ?description ?collaborator ?creationDate ?modifyDate where {",
    "optional {?vocabContext <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-přílohový-kontext> ?graph .",
    "graph ?graph {",
    " ?diagram og:index ?index .",
    " ?diagram og:name ?name .",
    " ?diagram og:id ?id .",
    " ?diagram og:representation ?representation .",
    " optional {?diagram og:active ?active.}",
    " optional {?diagram og:description ?description.}",
    " optional {?diagram og:vocabulary ?vocabulary. ",
    "           ?diagram og:collaborator ?collaborator. ",
    "           ?diagram og:creationDate ?creationDate. ",
    "           ?diagram og:modifiedDate ?modifyDate. ",
    " }",
    "}",
    "}",
    "optional {?vocabContext <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-aplikační-kontext> ?ogContext .",
    " graph ?ogContext {",
    "   ?ogContext og:viewColor ?color .",
    "   ?ogContext og:contextVersion ?context .",
    "  }",
    "}",
    `values ?vocabContext {<${AppSettings.contextIRIs.join("> <")}>}`,
    "} order by asc(?index)",
  ].join(`
  `);
  await processQuery(contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const indices: number[] = [];
      const contextInfo: {
        [key: string]: { appContext: boolean; diagrams: string[] };
      } = {};
      AppSettings.contextIRIs.forEach(
        (contextIRI) =>
          (contextInfo[contextIRI] = { appContext: false, diagrams: [] })
      );
      AppSettings.initWorkspace = true;
      let reconstructWorkspace = false;
      for (const result of data.results.bindings) {
        if (
          result.diagramGraph &&
          result.vocabContext &&
          !contextInfo[result.vocabContext.value].diagrams.includes(
            result.graph.value
          )
        )
          contextInfo[result.vocabContext.value].diagrams.push(
            result.graph.value
          );
        if (result.id && !(result.id.value in Diagrams)) {
          let index = parseInt(result.index.value);
          while (indices.includes(index)) index++;
          addDiagram(
            result.name.value,
            true,
            parseInt(result.representation.value, 10),
            index,
            result.diagram.value,
            result.id.value,
            result.graph.value
          );
          Diagrams[result.id.value].collaborators = [];
          Diagrams[result.id.value].saved = true;
          indices.push(index);
          AppSettings.initWorkspace = false;
        }
        if (result.context) {
          AppSettings.viewColorPool = result.color.value;
          AppSettings.contextVersion = parseInt(result.context.value, 10);
          AppSettings.applicationContext = result.ogContext.value;
          contextInfo[result.vocabContext.value].appContext = true;
        } else {
          reconstructWorkspace = true;
        }
        if (result.active) {
          Diagrams[result.id.value].active = result.active.value === "true";
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
      ret.contextsMissingAppContexts = Object.keys(contextInfo).filter(
        (context) => !contextInfo[context].appContext
      );
      ret.contextsMissingAttachments = Object.keys(contextInfo).filter(
        (context) =>
          contextInfo[context].diagrams.length !==
          Object.values(Diagrams).length
      );
      Object.entries(Diagrams).forEach(([key, value]) => {
        if (!indices.includes(value.index)) Diagrams[key].toBeDeleted = true;
        if (value.vocabularies.length === 0)
          Diagrams[key].vocabularies = Object.keys(
            WorkspaceVocabularies
          ).filter((v) => !WorkspaceVocabularies[v].readOnly);
      });
      ret.strategy = reconstructWorkspace
        ? ContextLoadingStrategy.RECONSTRUCT_WORKSPACE
        : ContextLoadingStrategy.DEFAULT;
    })
    .catch((e) => {
      console.error(e);
    });
  return ret;
}

export async function getLinksConfig(
  contextEndpoint: string
): Promise<boolean> {
  const query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?id ?iri ?sourceID ?targetID ?active ?sourceCard1 ?sourceCard2 ?targetCard1 ?targetCard2 ?type ?link where {",
    "graph <" + AppSettings.applicationContext + "> {",
    "?link a og:link .",
    "?link og:id ?id .",
    "?link og:iri ?iri .",
    "?link og:source ?sourceID .",
    "?link og:target ?targetID .",
    "?link og:active ?active .",
    "?link og:type ?type .",
    "?link og:sourceCardinality1 ?sourceCard1 .",
    "?link og:sourceCardinality2 ?sourceCard2 .",
    "?link og:targetCardinality1 ?targetCard1 .",
    "?link og:targetCardinality2 ?targetCard2 .",
    "}} order by ?id",
  ].join(`
  `);
  const links: {
    [key: string]: {
      iri: string;
      targetID: string;
      sourceID: string;
      vertices: { [key: string]: { x: number; y: number }[] };
      sourceCardinality1: string;
      sourceCardinality2: string;
      targetCardinality1: string;
      targetCardinality2: string;
      active: boolean;
      type: number;
      linkIRI: string;
    };
  } = {};
  const appContextLinkRetrieval = await processQuery(contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (const result of data.results.bindings) {
        if (
          !Object.values(links).find(
            (link) =>
              link.active &&
              link.iri === result.iri.value &&
              link.sourceID === result.sourceID.value &&
              link.targetID === result.targetID.value
          )
        ) {
          links[result.id.value] = {
            iri: result.iri.value,
            targetID: result.targetID.value,
            sourceID: result.sourceID.value,
            active: result.active.value === "true",
            vertices: {},
            type:
              result.type.value === "default"
                ? LinkType.DEFAULT
                : LinkType.GENERALIZATION,
            sourceCardinality1: result.sourceCard1.value,
            sourceCardinality2: result.sourceCard2.value,
            targetCardinality1: result.targetCard1.value,
            targetCardinality2: result.targetCard2.value,
            linkIRI: result.link.value,
          };
        }
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
  if (!appContextLinkRetrieval) return false;
  else {
    const diagramContextQuery = [
      "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
      "select ?graph ?vertex ?diagram ?diagramID ?index ?posX ?posY ?id ?iri where {",
      "graph <" + AppSettings.applicationContext + "> {",
      "?link a og:link.",
      "?link og:iri ?iri.",
      "}",
      "graph ?graph {",
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
      `values ?contextIRI {<${AppSettings.contextIRIs.join("> <")}>}`,
      "}",
    ].join(`
    `);
    return await processQuery(contextEndpoint, diagramContextQuery)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        for (const result of data.results.bindings) {
          if (!(result.id.value in links)) continue;
          const id = result.id.value;
          if (!(result.diagramID.value in links[id].vertices))
            links[id].vertices[result.diagramID.value] = [];
          links[id].vertices[result.diagramID.value][
            parseInt(result.index.value)
          ] = {
            x: parseInt(result.posX.value),
            y: parseInt(result.posY.value),
          };
        }
        for (const link in links) {
          if (
            !(links[link].sourceID in WorkspaceElements) ||
            !(links[link].targetID in WorkspaceElements)
          )
            continue;
          const sourceCard = new Cardinality("", "");
          const targetCard = new Cardinality("", "");
          sourceCard.setFirstCardinality(links[link].sourceCardinality1);
          sourceCard.setSecondCardinality(links[link].sourceCardinality2);
          targetCard.setFirstCardinality(links[link].targetCardinality1);
          targetCard.setSecondCardinality(links[link].targetCardinality2);
          WorkspaceLinks[link] = {
            iri: links[link].iri,
            source: links[link].sourceID,
            target: links[link].targetID,
            sourceCardinality: sourceCard,
            targetCardinality: targetCard,
            type: links[link].type,
            vertices: links[link].vertices,
            active: links[link].active,
            hasInverse:
              links[link].type !== LinkType.GENERALIZATION &&
              links[link].iri in Links,
            linkIRI: links[link].linkIRI,
          };
        }
        return true;
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
  }
}
