import * as _ from "lodash";
import { LinkType } from "../../config/Enum";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { Cardinality } from "../../datatypes/Cardinality";
import { addDiagram } from "../../function/FunctionCreateVars";
import { initLanguageObject } from "../../function/FunctionEditVars";
import { processQuery } from "../../interface/TransactionInterface";
import { WorkspaceLinks } from "../../config/Variables";

export async function getElementsConfig(
  contextEndpoint: string = AppSettings.contextEndpoint,
  diagramGraphs: string[] = Object.values(Diagrams).map((d) => d.graph)
): Promise<boolean> {
  if (diagramGraphs.length === 0) {
    return Promise.resolve(true);
  }
  const elements: { [key: string]: Partial<typeof WorkspaceElements[0]> } = {};
  const elementPositions: {
    [key: string]: Partial<typeof WorkspaceElements[0]>;
  } = {};
  const getElements = async (): Promise<boolean> => {
    const query = [
      "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
      "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
      "select ?elem ?scheme ?name ?vocabulary ?active where {",
      "graph ?graph {",
      "?elem a og:element .",
      "optional {?elem og:name ?name.}",
      "optional {?elem og:active ?active.}",
      "optional {?elem og:vocabulary ?vocabulary.}",
      "?elem og:scheme ?scheme .",
      "}",
      `values ?graph {<${diagramGraphs.join("> <")}>}`,
      "}",
    ].join(`
    `);
    return await processQuery(contextEndpoint, query)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        for (const result of data.results.bindings) {
          const iri = result.elem.value;
          if (!(iri in elements)) {
            elements[iri] = {
              active: true,
              position: {},
              hidden: {},
              selectedLabel: initLanguageObject(""),
              sourceLinks: [],
              targetLinks: [],
            };
          }
          if (result.active) {
            elements[iri].active = result.active.value === "true";
          }
          if (
            result.name &&
            !elements[iri].selectedLabel![result.name["xml:lang"]]
          )
            elements[iri].selectedLabel![result.name["xml:lang"]] =
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
  };
  const getElementPositions = async (): Promise<boolean> => {
    const query = [
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
      `values ?graph {<${diagramGraphs.join("> <")}>}`,
      "}",
    ].join(`
    `);
    return await processQuery(contextEndpoint, query)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        for (const result of data.results.bindings) {
          const iri = result.iri.value;
          if (!(iri in elementPositions))
            elementPositions[iri] = {
              hidden: {},
              position: {},
            };
          elementPositions[iri].position![result.diagramID.value] = {
            x: parseInt(result.posX.value),
            y: parseInt(result.posY.value),
          };
          elementPositions[iri].hidden![result.diagramID.value] =
            result.hidden.value === "true";
        }
        return true;
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
  };
  const ret = await Promise.all([getElements(), getElementPositions()]).then(
    (r) => r.every((r) => !!r)
  );
  const obj: typeof elements = {};
  _.merge(obj, elements, elementPositions);
  _.merge(
    WorkspaceElements,
    _.pick(
      obj,
      Object.keys(obj).filter((k) => !!obj[k].active)
    )
  );
  return ret;
}

export async function getSettings(contextEndpoint: string): Promise<boolean> {
  const query = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select distinct ?open ?vocabContext ?graph ?diagram ?index ?scale ?posX ?posY ?name ?id ?representation ?vocabulary ?description ?collaborator ?creationDate ?modifyDate where {",
    "?vocabContext <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-přílohový-kontext> ?graph .",
    "graph ?graph {",
    " ?diagram og:index ?index .",
    " ?diagram og:name ?name .",
    " ?diagram og:id ?id .",
    " ?diagram og:representation ?representation .",
    " optional {?diagram og:open ?open.}",
    " optional {?diagram og:description ?description.}",
    " optional {?diagram og:position-x ?posX.",
    "           ?diagram og:position-y ?posY.",
    "           ?diagram og:scale ?scale.",
    " }",
    " optional {?diagram og:vocabulary ?vocabulary. ",
    "           ?diagram og:collaborator ?collaborator. ",
    "           ?diagram og:creationDate ?creationDate. ",
    "           ?diagram og:modifiedDate ?modifyDate. ",
    " }",
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
        if (result.posX && result.posY && result.scale) {
          Diagrams[result.id.value].origin = {
            x: parseInt(result.posX.value, 10),
            y: parseInt(result.posY.value, 10),
          };
          Diagrams[result.id.value].scale = parseFloat(result.scale.value);
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
            result.collaborator.value,
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

export async function getLinksConfig(
  contextEndpoint: string = AppSettings.contextEndpoint,
  diagramGraphs: string[] = Object.values(Diagrams).map((d) => d.graph)
): Promise<boolean> {
  if (diagramGraphs.length === 0) {
    return Promise.resolve(true);
  }
  const links: { [key: string]: Partial<typeof WorkspaceLinks[0]> } = {};
  const linkVertices: { [key: string]: Partial<typeof WorkspaceLinks[0]> } = {};
  const getLinks = async (): Promise<boolean> => {
    const query = [
      "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
      "select distinct ?id ?iri ?sourceID ?targetID ?sourceCard1 ?sourceCard2 ?targetCard1 ?targetCard2 ?type ?link where {",
      "graph ?graph {",
      "?link a og:link .",
      "?link og:id ?id .",
      "?link og:iri ?iri .",
      "?link og:source ?sourceID .",
      "?link og:target ?targetID .",
      "?link og:type ?type .",
      "?link og:sourceCardinality1 ?sourceCard1 .",
      "?link og:sourceCardinality2 ?sourceCard2 .",
      "?link og:targetCardinality1 ?targetCard1 .",
      "?link og:targetCardinality2 ?targetCard2 .",
      "}",
      `values ?graph {<${diagramGraphs.join("> <")}>}`,
      "}",
    ].join(`
      `);
    return await processQuery(contextEndpoint, query)
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
                link.source === result.sourceID.value &&
                link.target === result.targetID.value
            )
          ) {
            const sourceCard = new Cardinality("", "");
            const targetCard = new Cardinality("", "");
            sourceCard.setFirstCardinality(result.sourceCard1.value);
            sourceCard.setSecondCardinality(result.sourceCard2.value);
            targetCard.setFirstCardinality(result.targetCard1.value);
            targetCard.setSecondCardinality(result.targetCard2.value);
            links[result.id.value] = {
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
              sourceCardinality: sourceCard,
              targetCardinality: targetCard,
            };
          }
        }
        return true;
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
  };
  const getVertices = async (): Promise<boolean> => {
    const query = [
      "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
      "select ?diagramID ?index ?posX ?posY ?id where {",
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
      `values ?graph {<${diagramGraphs.join("> <")}>}`,
      "}",
    ].join(`
      `);
    return await processQuery(contextEndpoint, query)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        for (const result of data.results.bindings) {
          const id = result.id.value;
          if (!(id in linkVertices) || !("vertices" in linkVertices[id]))
            linkVertices[id] = { vertices: {} };
          if (!(result.diagramID.value in linkVertices[id].vertices!))
            linkVertices[id].vertices![result.diagramID.value] = [];
          linkVertices[id].vertices![result.diagramID.value][
            parseInt(result.index.value)
          ] = {
            x: parseInt(result.posX.value),
            y: parseInt(result.posY.value),
          };
        }
        return true;
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
  };

  const ret = await Promise.all([getLinks(), getVertices()]).then((r) =>
    r.every((r) => !!r)
  );
  const obj: typeof links = {};
  _.merge(
    obj,
    links,
    _.pick(
      linkVertices,
      Object.keys(linkVertices).filter((k) => k in links)
    )
  );
  _.merge(WorkspaceLinks, obj);
  return ret;
}
