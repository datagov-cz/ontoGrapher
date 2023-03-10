import * as joint from "jointjs";
import _ from "lodash";
import React from "react";
import { Representation } from "../config/Enum";
import { Locale } from "../config/Locale";
import { RepresentationConfig } from "../config/logic/RepresentationConfig";
import {
  WorkspaceElements,
  AppSettings,
  Diagrams,
  WorkspaceVocabularies,
  WorkspaceTerms,
  WorkspaceLinks,
} from "../config/Variables";
import { graph } from "../graph/Graph";
import { graphElement } from "../graph/GraphElement";
import { paper } from "../main/DiagramCanvas";
import {
  fetchRelationships,
  fetchReadOnlyTerms,
} from "../queries/get/CacheQueries";
import { updateCreateDiagram } from "../queries/update/UpdateDiagramQueries";
import {
  updateProjectElementDiagram,
  updateProjectElement,
} from "../queries/update/UpdateElementQueries";
import {
  updateProjectLinkVertex,
  updateProjectLink,
} from "../queries/update/UpdateLinkQueries";
import { updateDeleteTriples } from "../queries/update/UpdateMiscQueries";
import { insertNewCacheTerms, insertNewRestrictions } from "./FunctionCache";
import {
  createNewElemIRI,
  addVocabularyElement,
  addClass,
  addToFlexSearch,
  removeFromFlexSearch,
} from "./FunctionCreateVars";
import {
  unHighlightCell,
  highlightCell,
  drawGraphElement,
} from "./FunctionDraw";
import { parsePrefix, initElements, deleteConcept } from "./FunctionEditVars";
import { getElementShape } from "./FunctionGetVars";
import { restoreHiddenElem, setRepresentation } from "./FunctionGraph";
import { initConnections } from "./FunctionRestriction";

export function resizeElem(id: string, highlight: boolean = true) {
  let view = paper.findViewByModel(id);
  if (view) {
    let bbox = view.getBBox();
    let cell = graph.getCell(id);
    let links = graph.getConnectedLinks(cell);
    for (let link of links) {
      if (link.getSourceCell()?.id === id) {
        link.source({ x: bbox.x, y: bbox.y });
      } else {
        link.target({ x: bbox.x, y: bbox.y });
      }
    }
    if (typeof cell.id === "string" && highlight) {
      unHighlightCell(cell.id);
      highlightCell(cell.id);
    }
    for (const link of links) {
      if (link.getSourceCell() === null) {
        link.source({
          id: id,
          connectionPoint: {
            name: "boundary",
            args: { selector: getElementShape(id) },
          },
        });
      } else {
        link.target({
          id: id,
          connectionPoint: {
            name: "boundary",
            args: { selector: getElementShape(id) },
          },
        });
      }
    }
  }
}

export function getElementPosition(id: string): joint.dia.Point {
  const point = WorkspaceElements[id].position[AppSettings.selectedDiagram];
  if (point) return { x: point.x + 200, y: point.y + 200 };
  else
    return {
      x: Diagrams[AppSettings.selectedDiagram].origin.x,
      y: Diagrams[AppSettings.selectedDiagram].origin.y,
    };
}

/**
 * Submits data about a new term into OG's internal data objects and places it onto the canvas, if applicable.
 * @param point Where on the canvas to put this new term, if applicable.
 * @param name Language object with names of the term.
 * @param language With which language to create the IRI and draw the term on the canvas with.
 * @param vocabulary The vocabulary that the term is supposed to belong to.
 * @param localPoint Whether the point is a local point (i.e. with an origin in the canvas).
 * @param types The types that the term is supposed to have.
 * @returns IRI (= ID) of the new term.
 */
export function createNewTerm(
  point: { x: number; y: number },
  name: { [key: string]: string },
  language: string,
  vocabulary: string,
  localPoint: boolean,
  types: string[] = []
): string {
  if (!(vocabulary in WorkspaceVocabularies))
    throw new Error(
      "Attempted to create a term for a vocabulary that is not recognized."
    );
  const iri = createNewElemIRI(
    WorkspaceVocabularies[vocabulary].glossary,
    name[language]
  );
  const p = localPoint ? point : paper.clientToLocalPoint(point);
  addVocabularyElement(iri, WorkspaceVocabularies[vocabulary].glossary, [
    parsePrefix("skos", "Concept"),
    ...types,
  ]);
  addClass(iri);
  addToFlexSearch(iri);
  WorkspaceTerms[iri].labels = name;
  WorkspaceElements[iri].hidden[AppSettings.selectedDiagram] = false;
  if (isElementVisible(WorkspaceTerms[iri].types, AppSettings.representation)) {
    const cls = new graphElement({ id: iri });
    if (p) {
      cls.position(p.x, p.y);
      WorkspaceElements[iri].position[AppSettings.selectedDiagram] = p;
    } else
      console.warn(
        "Unable to determine new element location; placing in canvas origin."
      );
    cls.addTo(graph);
    drawGraphElement(cls, language, AppSettings.representation);
  }
  return iri;
}

/**
 * Returns whether the element (based on its types) should be visible given a representation.
 * By default, true is returned even if the types contain none of the requested types.
 * This behaviour can be
 * @param types Types of the element.
 * @param representation Requested representation.
 * @param strict Enforce that the types must contain a requested representation type.
 * @returns if the element should be visible given the types and representation.
 */
export function isElementVisible(
  types: string[],
  representation: Representation,
  strict: boolean = false
) {
  return (
    (_.difference(
      RepresentationConfig[representation].visibleStereotypes,
      types
    ).length < RepresentationConfig[representation].visibleStereotypes.length ||
      !types.find((type) =>
        RepresentationConfig[Representation.FULL].visibleStereotypes.includes(
          type
        )
      )) &&
    (strict
      ? _.intersection(
          RepresentationConfig[representation].visibleStereotypes,
          types
        ).length > 0
      : true)
  );
}

export function getElementToolPosition(
  id: string | number,
  topRight: boolean = false
): { x: number | string; y: number | string } {
  switch (getElementShape(id)) {
    case "bodyEllipse":
      return topRight ? { x: "85%", y: "15%" } : { x: "15%", y: "15%" };
    case "bodyTrapezoid":
      return topRight ? { x: "100%", y: 0 } : { x: 20, y: 0 };
    case "bodyDiamond":
      return topRight ? { x: "75%", y: "25%" } : { x: "25%", y: "25%" };
    case "bodyBox":
      return topRight ? { x: "100%", y: 0 } : { x: 0, y: 0 };
    default:
      return topRight ? { x: "100%", y: 0 } : { x: 0, y: 0 };
  }
}

export function isElementHidden(id: string, diagram: string) {
  return (
    WorkspaceElements[id].hidden[diagram] ||
    WorkspaceElements[id].hidden[diagram] === undefined
  );
}

/**
 * Checks if the position of the element on the canvas differs from the position saved in the model.
 * @param elem The element to check
 */
export function isElementPositionOutdated(elem: joint.dia.Element) {
  const position = elem.position();
  const id = elem.id;
  return (
    position.x !==
      WorkspaceElements[id].position[AppSettings.selectedDiagram].x ||
    position.y !== WorkspaceElements[id].position[AppSettings.selectedDiagram].y
  );
}

/**
 * Moves elements on the canvas along with affected links (if applicable).
 * This function is to be called on a 'element:pointerup' event.
 * Returns update queries (to be pushed into the remote DB).
 * @param sourceElem ID of event source.
 * @param evt Mouse event.
 */
export function moveElements(
  sourceElem: joint.dia.Element,
  evt: JQuery.MouseUpEvent
): string[] {
  // get the selection rectangle data
  const { rect, bbox, ox, oy } = evt.data;
  const sourceID = sourceElem.id as string;
  if (rect) rect.remove();
  const movedLinks: string[] = [];
  const movedElems: string[] = [sourceID];
  WorkspaceElements[sourceID].position[AppSettings.selectedDiagram] =
    sourceElem.position();
  for (const id of AppSettings.selectedElements) {
    const elem = graph.getElements().find((elem) => elem.id === id);
    if (elem && id !== sourceID && bbox && ox && oy) {
      // calculate and save the new element positions
      const oldPos = elem.position();
      const diff = new joint.g.Point(bbox.x, bbox.y).difference(ox, oy);
      elem.position(
        oldPos.x + diff.x / Diagrams[AppSettings.selectedDiagram].scale,
        oldPos.y + diff.y / Diagrams[AppSettings.selectedDiagram].scale
      );
      // generate queries only if the position changed
      if (isElementPositionOutdated(elem)) {
        WorkspaceElements[id].position[AppSettings.selectedDiagram] =
          elem.position();
        movedElems.push(id);
        for (const link of graph.getConnectedLinks(elem)) {
          // if there are any connected links with vertices, calculate and save the new vertex positions
          const linkID = link.id as string;
          if (!movedLinks.includes(linkID) && link.vertices().length > 0) {
            movedLinks.push(linkID);
            link.vertices().forEach((vert, i) => {
              link.vertex(i, {
                x:
                  vert.x + diff.x / Diagrams[AppSettings.selectedDiagram].scale,
                y:
                  vert.y + diff.y / Diagrams[AppSettings.selectedDiagram].scale,
              });
            });
            WorkspaceLinks[linkID].vertices[AppSettings.selectedDiagram] =
              link.vertices();
          }
        }
      }
    }
  }
  const queries: string[] = [];
  if (movedElems.length > 0)
    queries.push(
      updateProjectElementDiagram(AppSettings.selectedDiagram, ...movedElems)
    );
  if (movedLinks.length > 0)
    queries.push(
      ...movedLinks.map((link) =>
        updateProjectLinkVertex(
          link,
          _.range(
            WorkspaceLinks[link].vertices[AppSettings.selectedDiagram].length
          )
        )
      )
    );
  return queries;
}

export async function putElementsOnCanvas(
  event: React.DragEvent<HTMLDivElement>,
  handleStatus: Function
): Promise<string[]> {
  const queries: string[] = [];
  if (event.dataTransfer) {
    const dataToParse = event.dataTransfer.getData("newClass");
    const data = JSON.parse(dataToParse);
    const iris = data.iri.filter((iri: string) => {
      return !(iri in WorkspaceTerms);
    });
    const ids = data.id.filter((id: string) => !graph.getCell(id));
    if (!data) {
      console.error(`Unable to parse element information from data:
      ${dataToParse}`);
      return [];
    }
    if (iris.length === 0 && ids.length === 0) {
      console.warn(`Expected to receive valid IRI data, got
      ${dataToParse}
      instead.`);
      return [];
    }
    if (!Diagrams[AppSettings.selectedDiagram].saved) {
      Diagrams[AppSettings.selectedDiagram].saved = true;
      queries.push(updateCreateDiagram(AppSettings.selectedDiagram));
    }
    if (iris.length > 0) {
      handleStatus(
        true,
        Locale[AppSettings.interfaceLanguage].downloadingTerms,
        true,
        false
      );
      const relationships = await fetchRelationships(
        AppSettings.contextEndpoint,
        iris
      );
      const readOnlyTerms = await fetchReadOnlyTerms(
        AppSettings.contextEndpoint,
        iris.concat(
          Representation.COMPACT === AppSettings.representation
            ? Object.keys(relationships)
            : []
        )
      );
      insertNewCacheTerms(readOnlyTerms);
      insertNewRestrictions(relationships);
      const newElements = initElements(true);
      const newConnections = initConnections().add;
      queries.push(updateProjectElement(false, ...newElements));
      queries.push(updateProjectLink(false, ...newConnections));
      ids.push(...newElements);
      addToFlexSearch(...ids);
    }
    const matrixLength = Math.max(ids.length, iris.length);
    const matrixDimension = Math.ceil(Math.sqrt(matrixLength));
    ids.forEach((id: string, i: number) => {
      const cls = new graphElement({ id: id });
      const point = paper.clientToLocalPoint({
        x: event.clientX,
        y: event.clientY,
      });
      if (matrixLength > 1) {
        const x = i % matrixDimension;
        const y = Math.floor(i / matrixDimension);
        cls.set("position", { x: point.x + x * 200, y: point.y + y * 200 });
        WorkspaceElements[id].position[AppSettings.selectedDiagram] = {
          x: point.x + x * 200,
          y: point.y + y * 200,
        };
      } else {
        cls.set("position", { x: point.x, y: point.y });
        WorkspaceElements[id].position[AppSettings.selectedDiagram] = {
          x: point.x,
          y: point.y,
        };
      }
      WorkspaceElements[id].hidden[AppSettings.selectedDiagram] = false;
      cls.addTo(graph);
      drawGraphElement(
        cls,
        AppSettings.canvasLanguage,
        AppSettings.representation
      );
      queries.push(
        ...restoreHiddenElem(id, true, true, true),
        updateProjectElementDiagram(AppSettings.selectedDiagram, id)
      );
    });
    if (AppSettings.representation === Representation.COMPACT)
      queries.push(
        ...setRepresentation(
          AppSettings.representation,
          AppSettings.selectedDiagram
        ).transaction
      );
  } else console.error("Did not receive element creation data from the event.");
  return queries;
}

export function removeReadOnlyElement(elem: string): string[] {
  removeFromFlexSearch(elem);
  return [
    ...deleteConcept(elem),
    updateDeleteTriples(
      elem,
      [
        AppSettings.applicationContext,
        ...Object.values(Diagrams).map((diag) => diag.graph),
      ],
      true,
      true,
      false
    ),
  ];
}
