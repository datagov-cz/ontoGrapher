import {
  AppSettings,
  Diagrams,
  PackageRoot,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { processQuery } from "../../interface/TransactionInterface";
import { Locale } from "../../config/Locale";
import { getWorkspaceContextIRI } from "../../function/FunctionGetVars";
import { LinkType } from "../../config/Enum";
import * as joint from "jointjs";
import { Cardinality } from "../../datatypes/Cardinality";
import { initLanguageObject } from "../../function/FunctionEditVars";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import { PackageNode } from "../../datatypes/PackageNode";

export async function getElementsConfig(
  contextEndpoint: string
): Promise<boolean> {
  let elements: {
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
  const query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "select ?id ?iri ?scheme ?active ?diagram ?index ?hidden ?posX ?posY ?name where {",
    "graph <" + getWorkspaceContextIRI() + "> {",
    "?elem a og:element .",
    "?elem og:iri ?iri .",
    "?elem og:id ?id .",
    "?elem og:active ?active .",
    "?elem og:diagram ?diagram .",
    "optional {?elem og:name ?name.}",
    "optional {?diagram og:index ?index.",
    "?diagram og:hidden ?hidden.",
    "?diagram og:position-x ?posX.",
    "?diagram og:position-y ?posY.",
    "}}",
    "?iri skos:inScheme ?scheme .",
    "}",
  ].join(" ");
  return await processQuery(contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (const result of data.results.bindings) {
        const iri = result.iri.value;
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
            new PackageNode(
              CacheSearchVocabularies[vocab].labels,
              PackageRoot,
              false,
              CacheSearchVocabularies[vocab].glossary
            );
          }
        }
        const id = elements[iri].id;
        const pkg = PackageRoot.children.find(
          (pkg) => pkg.scheme === elements[iri].scheme
        );
        if (pkg) {
          WorkspaceElements[id] = {
            iri: iri,
            connections: [],
            diagrams: elements[iri].diagrams,
            hidden: elements[iri].hidden,
            position: elements[iri].diagramPosition,
            package: pkg,
            active: elements[iri].active,
            selectedLabel: elements[iri].selectedName,
          };
          pkg.elements.push(id);
        }
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}

export async function getSettings(contextEndpoint: string): Promise<boolean> {
  let query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?diagram ?index ?name ?color ?active ?context where {",
    "BIND(<" + getWorkspaceContextIRI() + "> as ?ogContext).",
    "graph ?ogContext {",
    "?diagram og:index ?index .",
    "?diagram og:name ?name .",
    "optional {?diagram og:active ?active}",
    "optional {?ogContext og:viewColor ?color}",
    "optional {?ogContext og:contextVersion ?context}",
    "}",
    "}",
  ].join(" ");
  return await processQuery(contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.results.bindings.length === 0) AppSettings.initWorkspace = true;
      for (const result of data.results.bindings) {
        if (!(parseInt(result.index.value) in Diagrams)) {
          Diagrams[parseInt(result.index.value)] = {
            name: Locale[AppSettings.viewLanguage].untitled,
            active: result.active ? result.active.value === "true" : true,
            origin: { x: 0, y: 0 },
            scale: 1,
          };
        }
        Diagrams[parseInt(result.index.value)].name = result.name.value;
        if (result.color) AppSettings.viewColorPool = result.color.value;
        AppSettings.contextVersion = result.context
          ? parseInt(result.context.value, 10)
          : 1;
      }
      return true;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}

export async function getLinksConfig(
  contextEndpoint: string
): Promise<boolean> {
  let query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?id ?iri ?sourceID ?targetID ?source ?active ?target ?sourceCard1 ?sourceCard2 ?targetCard1 ?targetCard2 ?diagram ?vertex ?type ?index ?posX ?posY where {",
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
    "optional {?link og:vertex ?vertex.",
    "?vertex og:index ?index.",
    "?vertex og:position-x ?posX.",
    "?vertex og:position-y ?posY.",
    "optional {?vertex og:diagram ?diagram.}",
    "}}}",
  ].join(" ");
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
  return await processQuery(contextEndpoint, query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (let result of data.results.bindings) {
        if (!(result.id.value in links)) {
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
        if (
          result.vertex &&
          !(result.vertex.value in links[result.id.value].vertexIRI)
        )
          links[result.id.value].vertexIRI[result.vertex.value] = {
            index: parseInt(result.index.value),
            x: parseInt(result.posX.value),
            y: parseInt(result.posY.value),
            diagram: result.diagram ? parseInt(result.diagram.value) : -1,
          };
      }
      for (let link in links) {
        let convert: { [key: number]: joint.dia.Link.Vertex[] } = {};
        let keys = Object.keys(links[link].vertexIRI);
        if (keys.length > 0) {
          let skipDeprecated = keys.find((iri: string) =>
            iri.includes("/diagram")
          );
          for (let vertexIRI of keys) {
            if (!vertexIRI.includes("/diagram") && skipDeprecated) continue;
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
