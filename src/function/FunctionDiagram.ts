import { StoreSettings } from "./../config/Store";
import { AppSettings, Diagrams, WorkspaceElements } from "../config/Variables";
import { graphElement } from "../graph/GraphElement";
import { graph } from "../graph/Graph";
import { drawGraphElement, unHighlightCells } from "./FunctionDraw";
import { restoreHiddenElem, setRepresentation } from "./FunctionGraph";
import { MainViewMode, Representation } from "../config/Enum";
import { paper } from "../main/DiagramCanvas";
import * as _ from "lodash";
import { isElementHidden } from "./FunctionElem";

export function changeDiagrams(diagram?: string) {
  if (!diagram) {
    const availableDiagrams = Object.keys(Diagrams).filter(
      (diag) => Diagrams[diag].active && !Diagrams[diag].toBeDeleted
    );
    if (availableDiagrams.length > 0) {
      diagram = availableDiagrams.reduce((a, b) =>
        Diagrams[a].index < Diagrams[b].index ? a : b
      );
    } else {
      AppSettings.selectedDiagram = "";
      StoreSettings.update((s) => {
        s.mainViewMode = MainViewMode.MANAGER;
        s.selectedDiagram = "";
      });
      return;
    }
  }

  if (diagram && Diagrams[diagram]) {
    graph.clear();
    clearSelection();
    AppSettings.selectedDiagram = diagram;
    for (const id in WorkspaceElements) {
      if (
        !isElementHidden(id, diagram) &&
        WorkspaceElements[id].position[diagram] &&
        WorkspaceElements[id].active
      ) {
        const cls = new graphElement({ id: id });
        cls.position(
          WorkspaceElements[id].position[diagram].x,
          WorkspaceElements[id].position[diagram].y
        );
        cls.addTo(graph);
        drawGraphElement(cls, AppSettings.canvasLanguage, Representation.FULL);
        restoreHiddenElem(id, true, false, false);
      }
    }
    setRepresentation(Diagrams[diagram].representation, diagram, false);
    if (Diagrams[diagram].origin.x === 0 && Diagrams[diagram].origin.y === 0) {
      centerDiagram();
    } else {
      paper.scale(Diagrams[diagram].scale, Diagrams[diagram].scale);
      paper.translate(Diagrams[diagram].origin.x, Diagrams[diagram].origin.y);
    }
    StoreSettings.update((s) => {
      s.selectedDiagram = diagram!;
    });
  } else {
    console.warn(
      "Attempted change to a diagram ID " + diagram + " that doesn't exist."
    );
    AppSettings.selectedDiagram = "";
    StoreSettings.update((s) => {
      s.mainViewMode = MainViewMode.MANAGER;
      s.selectedDiagram = "";
    });
  }
}

export function centerDiagram(
  p: joint.dia.Paper = paper,
  g: joint.dia.Graph = graph
) {
  p.translate(0, 0);
  let x = 0;
  let y = 0;
  const scale = p.scale().sx;
  for (const elem of g.getElements()) {
    x += elem.getBBox().x;
    y += elem.getBBox().y;
  }
  p.translate(
    -((x / g.getElements().length) * scale) + p.getComputedSize().width / 2,
    -((y / g.getElements().length) * scale) + p.getComputedSize().height / 2
  );
  if (g === graph) updateDiagramPosition(AppSettings.selectedDiagram);
}

export function zoomDiagram(
  x: number,
  y: number,
  delta: number,
  p: joint.dia.Paper = paper,
  updatePosition: boolean = true
) {
  const oldTranslate = p.translate();
  const oldScale = p.scale().sx;
  const nextScale = delta === 0 ? 1 : _.round(delta * 0.1 + oldScale, 1);
  if (nextScale >= 0.1 && nextScale <= 2.1) {
    p.translate(
      oldTranslate.tx + x * (oldScale - nextScale),
      oldTranslate.ty + y * (oldScale - nextScale)
    );
    p.scale(nextScale, nextScale);
    if (updatePosition) updateDiagramPosition(AppSettings.selectedDiagram);
  }
}

/**
 * Saves the diagram position and scale information.
 * @param diagram The diagram to be updated
 */
export function updateDiagramPosition(diagram: string) {
  Diagrams[diagram].origin = {
    x: paper.translate().tx,
    y: paper.translate().ty,
  };
  Diagrams[diagram].scale = paper.scale().sx;
}

/**
 *  Resets the diagram's selections (deselects the links and/or the elements selected).
 */
export function resetDiagramSelection() {
  unHighlightCells(...AppSettings.selectedElements);
  unHighlightCells(...AppSettings.selectedLinks);
  clearSelection();
}

export function clearSelection() {
  AppSettings.selectedLinks = [];
  AppSettings.selectedElements = [];
}

export function removeFromSelection(id: string) {
  const cell = graph.getCell(id);
  if (!cell) return;
  if (cell.isLink()) {
    const index = AppSettings.selectedLinks.indexOf(id);
    if (index !== -1) AppSettings.selectedLinks.splice(index, 1);
  } else if (cell.isElement()) {
    const index = AppSettings.selectedElements.indexOf(id);
    if (index !== -1) AppSettings.selectedElements.splice(index, 1);
  }
}

export function addToSelection(id: string) {
  const cell = graph.getCell(id);
  if (!cell) return;
  if (cell.isLink()) {
    if (!AppSettings.selectedLinks.includes(id))
      AppSettings.selectedLinks.push(id);
  } else if (cell.isElement()) {
    if (!AppSettings.selectedElements.includes(id))
      AppSettings.selectedElements.push(id);
  }
}
