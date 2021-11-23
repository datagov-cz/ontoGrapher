import {
  AppSettings,
  Diagrams,
  FolderRoot,
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { processQuery } from "../../interface/TransactionInterface";
import { getWorkspaceContextIRI } from "../../function/FunctionGetVars";
import { ContextLoadingStrategy, LinkType } from "../../config/Enum";
import * as joint from "jointjs";
import { Cardinality } from "../../datatypes/Cardinality";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import { addDiagram } from "../../function/FunctionCreateVars";
import { qb } from "../QueryBuilder";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import { VocabularyNode } from "../../datatypes/VocabularyNode";

export async function getElementsConfig(
  contextEndpoint: string
): Promise<boolean> {
  const elements: {
    [key: string]: {
      id: "";
      active: boolean;
      diagramPosition: { [key: number]: { x: number; y: number } };
      hidden: { [key: number]: boolean };
      diagrams: number[];
      selectedName: { [key: string]: string };
      scheme: string;
    };
  } = {};
  const appContextQuery = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "select ?elem ?id ?scheme ?active ?name where {",
    "graph <" + getWorkspaceContextIRI() + "> {",
    "?elem a og:element .",
    "?elem og:id ?id .",
    "?elem og:active ?active .",
    "?elem og:name ?name.",
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
            id: result.id.value,
            diagrams: [],
            active: result.active.value === "true",
            diagramPosition: {},
            hidden: {},
            selectedName: initLanguageObject(""),
            scheme: result.scheme.value,
          };
        }
        if (result.name && !elements[iri].selectedName[result.name["xml:lang"]])
          elements[iri].selectedName[result.name["xml:lang"]] =
            result.name.value;
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
      "select ?diagram ?index ?iri ?posX ?posY ?hidden where {",
      "graph ?diagram {",
      "?iri og:position-x ?posX.",
      "?iri og:position-y ?posY.",
      "?iri og:hidden ?hidden.",
      "}",
      `${qb.i(AppSettings.contextIRI)} ${qb.i(
        parsePrefix(
          "d-sgov-pracovní-prostor-pojem",
          `odkazuje-na-assetový-kontext`
        )
      )} ?diagram.`,
      `?diagram ${qb.i(
        parsePrefix("d-sgov-pracovní-prostor-pojem", `má-typ-assetu`)
      )} og:diagram.`,
      `?diagram og:index ?index.`,
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
            if (
              result.index &&
              !elements[iri].diagrams.includes(parseInt(result.index.value))
            ) {
              elements[iri].diagrams.push(parseInt(result.index.value));
              elements[iri].diagramPosition[parseInt(result.index.value)] = {
                x: parseInt(result.posX.value),
                y: parseInt(result.posY.value),
              };
              elements[iri].hidden[parseInt(result.index.value)] =
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
              graph: AppSettings.cacheContext,
              color: "#FFF",
              count: 0,
              glossary: CacheSearchVocabularies[vocab].glossary,
            };
            new VocabularyNode(
              CacheSearchVocabularies[vocab].labels,
              FolderRoot,
              false,
              CacheSearchVocabularies[vocab].glossary
            );
          }
        }
        const id = elements[iri].id;
        const pkg = FolderRoot.children.find(
          (pkg) => pkg.scheme === elements[iri].scheme
        );
        if (pkg) {
          WorkspaceElements[id] = {
            iri: iri,
            connections: [],
            diagrams: elements[iri].diagrams,
            hidden: elements[iri].hidden,
            position: elements[iri].diagramPosition,
            vocabularyNode: pkg,
            active: elements[iri].active,
            selectedLabel: elements[iri].selectedName,
          };
          pkg.elements.push(id);
        }
      }
    }
    return true;
  }
}

export async function getSettings(
  contextEndpoint: string
): Promise<ContextLoadingStrategy | undefined> {
  const query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?diagram ?index ?name ?color ?active ?id ?representation ?context ?legacyContext where {",
    "BIND(<" + AppSettings.contextIRI + "> as ?metaContext).",
    "BIND(<" + getWorkspaceContextIRI() + "> as ?ogContext).",
    "OPTIONAL {",
    "graph ?metaContext {",
    `?metaContext ${qb.i(
      parsePrefix(
        "d-sgov-pracovní-prostor-pojem",
        `odkazuje-na-assetový-kontext`
      )
    )} ?diagram .`,
    "}",
    "graph ?diagram {",
    `?diagram ${qb.i(
      parsePrefix("d-sgov-pracovní-prostor-pojem", "má-typ-assetu")
    )} og:diagram.`,
    "?diagram og:index ?index .",
    "?diagram og:name ?name .",
    "?diagram og:id ?id .",
    "?diagram og:representation ?representation .",
    "}",
    "}",
    "OPTIONAL {",
    "?ogContext og:viewColor ?color .",
    "?ogContext og:contextVersion ?context .",
    "}",
    "OPTIONAL {",
    `<${
      AppSettings.ontographerContext +
      AppSettings.contextIRI.substring(AppSettings.contextIRI.lastIndexOf("/"))
    }> og:contextVersion ?legacyContext.`,
    "}}",
  ].join(`
  `);
  return await processQuery(contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      AppSettings.initWorkspace = true;
      let reconstructWorkspace = false;
      for (const result of data.results.bindings) {
        if (result.index || (result.active && result.active.value === "true")) {
          const index = parseInt(result.index.value);
          Diagrams[index] = addDiagram(result.name.value);
          Diagrams[index].representation = parseInt(
            result.representation.value,
            10
          );
          Diagrams[index].id = result.id.value;
          AppSettings.initWorkspace = false;
          if (result.context) {
            AppSettings.viewColorPool = result.color.value;
            AppSettings.contextVersion = parseInt(result.context.value, 10);
          } else {
            reconstructWorkspace = true;
          }
        } else if (result.legacyContext) {
          AppSettings.contextVersion = parseInt(result.legacyContext.value, 10);
          return ContextLoadingStrategy.UPDATE_LEGACY_WORKSPACE;
        }
      }
      return reconstructWorkspace
        ? ContextLoadingStrategy.RECONSTRUCT_WORKSPACE
        : ContextLoadingStrategy.DEFAULT;
    })
    .catch((e) => {
      console.error(e);
      return undefined;
    });
}

export async function getLinksConfig(
  contextEndpoint: string
): Promise<boolean> {
  let query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?id ?iri ?sourceID ?targetID ?source ?active ?target ?sourceCard1 ?sourceCard2 ?targetCard1 ?targetCard2 ?type where {",
    "graph <" + getWorkspaceContextIRI() + "> {",
    "?link a og:link .",
    "?link og:id ?id .",
    "?link og:iri ?iri .",
    "?link og:source-id ?sourceID .",
    "?link og:target-id ?targetID .",
    "?link og:source ?source .",
    "?link og:active ?active .",
    "?link og:target ?target .",
    "?link og:type ?type .",
    "?link og:sourceCardinality1 ?sourceCard1 .",
    "?link og:sourceCardinality2 ?sourceCard2 .",
    "?link og:targetCardinality1 ?targetCard1 .",
    "?link og:targetCardinality2 ?targetCard2 .",
    "}} order by ?id",
  ].join(`
  `);
  let links: {
    [key: string]: {
      iri: string;
      source: string;
      target: string;
      targetID: string;
      sourceID: string;
      vertexIRI: {
        [key: string]: {
          index: number;
          x: number;
          y: number;
          diagram: number;
        };
      };
      vertices: { [key: number]: { [key: number]: { x: number; y: number } } };
      sourceCardinality1: string;
      sourceCardinality2: string;
      targetCardinality1: string;
      targetCardinality2: string;
      active: boolean;
      type: number;
    };
  } = {};
  const appContextLinkRetrieval = await processQuery(contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (const result of data.results.bindings) {
        if (
          result.iri.value in Links ||
          (result.iri.value in WorkspaceTerms &&
            !Object.values(links).find((link) => link.iri === result.iri.value))
        ) {
          links[result.id.value] = {
            iri: result.iri.value,
            source: result.source.value,
            target: result.target.value,
            targetID: result.targetID.value,
            sourceID: result.sourceID.value,
            active: result.active.value === "true",
            vertexIRI: {},
            vertices: {},
            type:
              result.type.value === "default"
                ? LinkType.DEFAULT
                : LinkType.GENERALIZATION,
            sourceCardinality1: result.sourceCard1.value,
            sourceCardinality2: result.sourceCard2.value,
            targetCardinality1: result.targetCard1.value,
            targetCardinality2: result.targetCard2.value,
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
      "select ?vertex ?diagram ?index ?diagramIndex ?posX ?posY ?id ?iri where {",
      "graph <" + getWorkspaceContextIRI() + "> {",
      "?link a og:link.",
      "?link og:iri ?iri.",
      "}",
      "graph ?diagram {",
      "?link og:vertex ?vertex.",
      "?link og:id ?id.",
      "?vertex og:index ?index.",
      "?vertex og:position-x ?posX.",
      "?vertex og:position-y ?posY.",
      "}",
      `${qb.i(AppSettings.contextIRI)} ${qb.i(
        parsePrefix(
          "d-sgov-pracovní-prostor-pojem",
          `odkazuje-na-assetový-kontext`
        )
      )} ?diagram.`,
      `?diagram ${qb.i(
        parsePrefix("d-sgov-pracovní-prostor-pojem", `má-typ-assetu`)
      )} og:diagram.`,
      `?diagram og:index ?diagramIndex.`,
      "}",
    ].join(`
    `);
    return await processQuery(contextEndpoint, diagramContextQuery)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        for (const result of data.results.bindings) {
          const id =
            result.id.value in links
              ? result.id.value
              : Object.keys(links).find(
                  (link) => links[link].iri === result.iri.value
                );
          if (id && !(result.vertex.value in links[id].vertexIRI))
            links[result.id.value].vertexIRI[result.vertex.value] = {
              index: parseInt(result.index.value),
              x: parseInt(result.posX.value),
              y: parseInt(result.posY.value),
              diagram: parseInt(result.diagramIndex.value),
            };
          // This is not necessarily an issue. What this means is there is some corrupted data from a buggy version
          // of OG that is now recognized and left behind - the worst that happens is that some link vertices have
          // been reset.
          // Example: A compact link corresponding to a <<relationship-type>> term which is not found in the workspace.
          // The issue arises whenever this data is generated by the *current* OG version - hence the warning.
          else
            console.warn(
              `Warning: Link ID ${result.id.value} not found for vertex IRI ${result.vertex.value}. Vertex and/or link data may have been corrupted.`
            );
        }
        for (const link in links) {
          let convert: { [key: number]: joint.dia.Link.Vertex[] } = {};
          let keys = Object.keys(links[link].vertexIRI);
          if (keys.length > 0) {
            for (let vertexIRI of keys) {
              let vertex = links[link].vertexIRI[vertexIRI];
              let diagram: number = vertex.diagram !== -1 ? vertex.diagram : 0;
              if (!(diagram in convert)) convert[diagram] = [];
              convert[diagram][vertex.index] = { x: vertex.x, y: vertex.y };
            }
          }
          let sourceID, targetID;
          for (let id in WorkspaceElements) {
            if (WorkspaceElements[id].iri === links[link].source) sourceID = id;
            if (WorkspaceElements[id].iri === links[link].target) targetID = id;
            if (targetID && sourceID) break;
          }

          if (targetID && sourceID) {
            let sourceCard = new Cardinality("", "");
            let targetCard = new Cardinality("", "");
            sourceCard.setFirstCardinality(links[link].sourceCardinality1);
            sourceCard.setSecondCardinality(links[link].sourceCardinality2);
            targetCard.setFirstCardinality(links[link].targetCardinality1);
            targetCard.setSecondCardinality(links[link].targetCardinality2);
            WorkspaceLinks[link] = {
              iri: links[link].iri,
              source: sourceID,
              target: targetID,
              sourceCardinality: sourceCard,
              targetCardinality: targetCard,
              type: links[link].type,
              vertices: convert,
              active: links[link].active,
              hasInverse:
                links[link].type !== LinkType.GENERALIZATION &&
                links[link].iri in Links,
            };
            if (sourceID) {
              if (!WorkspaceElements[sourceID].connections.includes(link)) {
                WorkspaceElements[sourceID].connections.push(link);
              }
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
}
