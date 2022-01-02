import { v4 as uuidv4 } from "uuid";
import { qb } from "../../QueryBuilder";
import {
  getLinkIRI,
  getNewDiagramContextIRI,
  getWorkspaceContextIRI,
} from "../../../function/FunctionGetVars";
import {
  AppSettings,
  Diagrams,
  FolderRoot,
  WorkspaceElements,
  WorkspaceLinks,
} from "../../../config/Variables";
import { processQuery } from "../../../interface/TransactionInterface";
import { addDiagram } from "../../../function/FunctionCreateVars";
import { Locale } from "../../../config/Locale";
import {
  initLanguageObject,
  parsePrefix,
} from "../../../function/FunctionEditVars";
import { LinkType } from "../../../config/Enum";
import { Cardinality } from "../../../datatypes/Cardinality";
import { LinkConfig } from "../../../config/logic/LinkConfig";

export async function updateLegacyWorkspaceToVersion4(
  contextIRI: string,
  contextEndpoint: string
): Promise<string[]> {
  const triples: string[] = [];
  const schemes: { [key: string]: string } = {};
  const diagrams = await getLegacyDiagrams(contextIRI, contextEndpoint);
  const elements = await getLegacyElements(
    contextIRI,
    contextEndpoint,
    schemes,
    diagrams
  );
  const links = await getLegacyConnections(
    contextIRI,
    contextEndpoint,
    elements
  );
  function getDiagramIRI(id: string) {
    const projectID = AppSettings.contextIRI.substring(
      AppSettings.contextIRI.lastIndexOf("/")
    );
    return parsePrefix(
      "d-sgov-pracovní-prostor-pojem",
      `přílohový-kontext${projectID}/diagram/${id}`
    );
  }
  const elemStatements = Object.keys(elements).map((element) =>
    [
      qb.s(qb.i(elements[element].iri), "rdf:type", "og:element"),
      qb.s(qb.i(elements[element].iri), "og:id", qb.ll(element)),
      qb.s(qb.i(elements[element].iri), "og:scheme", qb.i(schemes[element])),
      qb.s(
        qb.i(elements[element].iri),
        "og:name",
        qb.a(
          Object.keys(elements[element].selectedLabel).map((lang) =>
            qb.ll(elements[element].selectedLabel[lang], lang)
          )
        )
      ),
      qb.s(
        qb.i(elements[element].iri),
        "og:active",
        qb.ll(elements[element].active)
      ),
    ].join(`
  `)
  );
  const linkStatements = Object.keys(links).map((id) => {
    const linkIRI = qb.i(links[id].linkIRI);
    return [
      qb.s(linkIRI, "rdf:type", "og:link"),
      qb.s(linkIRI, "og:id", qb.ll(id)),
      qb.s(linkIRI, "og:iri", qb.i(links[id].iri)),
      qb.s(linkIRI, "og:active", qb.ll(links[id].active)),
      qb.s(linkIRI, "og:source-id", qb.ll(links[id].source)),
      qb.s(linkIRI, "og:target-id", qb.ll(links[id].target)),
      qb.s(linkIRI, "og:source", qb.i(elements[links[id].source].iri)),
      qb.s(linkIRI, "og:target", qb.i(elements[links[id].target].iri)),
      qb.s(linkIRI, "og:type", qb.ll(LinkConfig[links[id].type].id)),
      qb.s(
        linkIRI,
        "og:sourceCardinality1",
        qb.ll(links[id].sourceCardinality.getFirstCardinality())
      ),
      qb.s(
        linkIRI,
        "og:sourceCardinality2",
        qb.ll(links[id].sourceCardinality.getSecondCardinality())
      ),
      qb.s(
        linkIRI,
        "og:targetCardinality1",
        qb.ll(links[id].targetCardinality.getFirstCardinality())
      ),
      qb.s(
        linkIRI,
        "og:targetCardinality2",
        qb.ll(links[id].targetCardinality.getSecondCardinality())
      ),
    ].join(`
  `);
  });
  Object.keys(diagrams).forEach((diagram, i) => {
    const diagramIRI = getDiagramIRI(diagram);
    triples.push(
      qb.g(contextIRI, [
        qb.s(
          qb.i(AppSettings.contextIRI),
          qb.i(
            parsePrefix(
              "d-sgov-pracovní-prostor-pojem",
              `odkazuje-na-přílohový-kontext`
            )
          ),
          qb.i(diagramIRI)
        ),
      ])
    );
    triples.push(
      qb.g(diagramIRI, [
        qb.s(qb.i(diagramIRI), "rdf:type", "og:diagram"),
        qb.s(qb.i(diagramIRI), "og:index", qb.ll(i)),
        qb.s(qb.i(diagramIRI), "og:name", qb.ll(diagrams[diagram].name)),
        qb.s(qb.i(diagramIRI), "og:id", qb.ll(diagram)),
        qb.s(
          qb.i(diagramIRI),
          "rdf:type",
          qb.i(
            parsePrefix("d-sgov-pracovní-prostor-pojem", "přílohový-kontext")
          )
        ),
        qb.s(
          qb.i(diagramIRI),
          qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "má-typ-přílohy")),
          "og:diagram"
        ),
        qb.s(
          qb.i(diagramIRI),
          "og:representation",
          qb.ll(diagrams[diagram].representation)
        ),
        ...linkStatements,
        ...elemStatements,
      ])
    );
  });
  Object.keys(links).forEach((link) =>
    Object.keys(links[link].vertices).forEach((diagram) => {
      links[link].vertices[diagram].forEach((vertex, j) => {
        if (!diagrams[diagram]) return;
        const linkIRI = links[link].linkIRI;
        triples.push(
          qb.g(getDiagramIRI(diagram), [
            qb.s(qb.i(linkIRI), "og:id", qb.ll(link)),
            qb.s(
              qb.i(linkIRI),
              "og:vertex",
              qb.i(`${linkIRI}/vertex-${j + 1}`)
            ),
            qb.s(qb.i(`${linkIRI}/vertex-${j + 1}`), "og:index", qb.ll(j)),
            qb.s(
              qb.i(`${linkIRI}/vertex-${j + 1}`),
              "og:position-x",
              qb.ll(Math.round(vertex.x))
            ),
            qb.s(
              qb.i(`${linkIRI}/vertex-${j + 1}`),
              "og:position-y",
              qb.ll(Math.round(vertex.y))
            ),
          ])
        );
      });
    })
  );
  triples.push(qb.g(getWorkspaceContextIRI(), linkStatements));
  triples.push(qb.g(getWorkspaceContextIRI(), elemStatements));
  Object.keys(elements).forEach((element) =>
    Object.keys(elements[element].hidden).forEach((diagram) => {
      if (!diagrams[diagram]) return;
      triples.push(
        qb.g(getDiagramIRI(diagram), [
          qb.s(
            qb.i(`${elements[element].iri}`),
            "og:position-x",
            qb.ll(Math.round(elements[element].position[diagram].x))
          ),
          qb.s(
            qb.i(`${elements[element].iri}`),
            "og:position-y",
            qb.ll(Math.round(elements[element].position[diagram].y))
          ),
          qb.s(
            qb.i(`${elements[element].iri}`),
            "og:hidden",
            qb.ll(elements[element].hidden[diagram])
          ),
        ])
      );
    })
  );
  Object.keys(diagrams).forEach((diagram) => {
    addDiagram(
      diagrams[diagram].name,
      true,
      diagrams[diagram].representation,
      diagrams[diagram].index,
      getNewDiagramContextIRI(diagram),
      diagram
    );
  });
  return triples;
}

async function getLegacyDiagrams(
  contextIRI: string,
  contextEndpoint: string
): Promise<typeof Diagrams> {
  const diagrams: typeof Diagrams = {};
  let query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?diagram ?index ?name ?color ?representation ?active ?context where {",
    "BIND(<" + getLegacyWorkspaceContext() + "> as ?ogContext).",
    "graph ?ogContext {",
    "?diagram og:index ?index .",
    "?diagram og:name ?name .",
    "optional {?diagram og:representation ?representation .}",
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
      for (let result of data.results.bindings) {
        if (!(parseInt(result.index.value) in diagrams)) {
          if (result.active && result.active.value !== "true") continue;
          const id = uuidv4();
          diagrams[id] = {
            name: Locale[AppSettings.interfaceLanguage].untitled,
            active: result.active ? result.active.value === "true" : true,
            origin: { x: 0, y: 0 },
            scale: 1,
            index: parseInt(result.index.value),
            representation: parseInt(result.representation.value),
            iri: getNewDiagramContextIRI(id),
            graph: getNewDiagramContextIRI(id),
          };
        }
        diagrams[parseInt(result.index.value)].name = result.name.value;
      }
      return diagrams;
    })
    .catch((e) => {
      console.error(e);
      return {};
    });
}

function getLegacyWorkspaceContext(): string {
  return (
    AppSettings.ontographerContext +
    AppSettings.contextIRI.substring(AppSettings.contextIRI.lastIndexOf("/"))
  );
}

async function getLegacyElements(
  contextIRI: string,
  contextEndpoint: string,
  schemes: { [key: string]: string },
  diagrams: typeof Diagrams
): Promise<typeof WorkspaceElements> {
  const elements: typeof WorkspaceElements = {};
  const query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
    "select ?id ?iri ?scheme ?active ?diagram ?index ?hidden ?posX ?posY ?name ?scheme where {",
    "graph <" + getLegacyWorkspaceContext() + "> {",
    "?elem a og:element .",
    "?elem og:iri ?iri .",
    "?elem og:id ?id .",
    "?elem og:active ?active .",
    "?elem og:scheme ?scheme .",
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
        const id = result.id.value;
        if (!(id in elements)) {
          elements[id] = {
            iri: result.iri.value,
            connections: [],
            hidden: {},
            position: {},
            vocabularyNode: FolderRoot,
            active: result.active.value === "true",
            selectedLabel: initLanguageObject(""),
          };
          schemes[id] = result.scheme.value;
        }
        if (result.name && !elements[id].selectedLabel[result.name["xml:lang"]])
          elements[id].selectedLabel[result.name["xml:lang"]] =
            result.name.value;
        const diagramID = Object.keys(diagrams).find(
          (diag) => diagrams[diag].index === parseInt(result.index.value)
        );
        if (
          diagramID &&
          result.index &&
          !(diagramID in elements[id].position)
        ) {
          elements[id].position[diagramID] = {
            x: parseInt(result.posX.value),
            y: parseInt(result.posY.value),
          };
          elements[id].hidden[diagramID] = result.hidden.value === "true";
        }
      }
      return elements;
    })
    .catch((e) => {
      console.error(e);
      return {};
    });
}

async function getLegacyConnections(
  contextIRI: string,
  contextEndpoint: string,
  elements: typeof WorkspaceElements
): Promise<typeof WorkspaceLinks> {
  const links: typeof WorkspaceLinks = {};
  let query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?id ?iri ?sourceID ?targetID ?source ?active ?target ?sourceCard1 ?sourceCard2 ?targetCard1 ?targetCard2 ?diagram ?vertex ?type ?index ?posX ?posY where {",
    "graph <" + getLegacyWorkspaceContext() + "> {",
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
  let iter: {
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
        if (!(result.id.value in iter)) {
          iter[result.id.value] = {
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
          !(result.vertex.value in iter[result.id.value].vertexIRI)
        )
          iter[result.id.value].vertexIRI[result.vertex.value] = {
            index: parseInt(result.index.value),
            x: parseInt(result.posX.value),
            y: parseInt(result.posY.value),
            diagram: result.diagram ? parseInt(result.diagram.value) : -1,
          };
      }
      for (let link in iter) {
        let convert: { [key: number]: joint.dia.Link.Vertex[] } = {};
        let keys = Object.keys(iter[link].vertexIRI);
        if (keys.length > 0) {
          let skipDeprecated = keys.find((iri: string) =>
            iri.includes("/diagram")
          );
          for (let vertexIRI of keys) {
            if (!vertexIRI.includes("/diagram") && skipDeprecated) continue;
            let vertex = iter[link].vertexIRI[vertexIRI];
            let diagram: number = vertex.diagram !== -1 ? vertex.diagram : 0;
            if (!(diagram in convert)) convert[diagram] = [];
            convert[diagram][vertex.index] = { x: vertex.x, y: vertex.y };
          }
        }
        let sourceID, targetID;
        for (let id in elements) {
          if (elements[id].iri === iter[link].source) sourceID = id;
          if (elements[id].iri === iter[link].target) targetID = id;
          if (targetID && sourceID) break;
        }

        if (targetID && sourceID) {
          let sourceCard = new Cardinality("", "");
          let targetCard = new Cardinality("", "");
          sourceCard.setFirstCardinality(iter[link].sourceCardinality1);
          sourceCard.setSecondCardinality(iter[link].sourceCardinality2);
          targetCard.setFirstCardinality(iter[link].targetCardinality1);
          targetCard.setSecondCardinality(iter[link].targetCardinality2);
          links[link] = {
            iri: iter[link].iri,
            source: sourceID,
            target: targetID,
            sourceCardinality: sourceCard,
            targetCardinality: targetCard,
            type: iter[link].type,
            vertices: convert,
            active: iter[link].active,
            hasInverse: false,
            linkIRI: getLinkIRI(link),
          };
          if (sourceID) {
            if (!elements[sourceID].connections.includes(link)) {
              elements[sourceID].connections.push(link);
            }
          }
        }
      }
      return links;
    })
    .catch((e) => {
      console.error(e);
      return {};
    });
}
