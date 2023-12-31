import * as joint from "jointjs";
import { Representation } from "../config/Enum";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
} from "../config/Variables";
import { CellColors } from "../config/visual/CellColors";
import { Shapes } from "../config/visual/Shapes";
import { graph } from "../graph/Graph";
import { LanguageObject } from "./../config/Languages";
import {
  addToSelection,
  clearSelection,
  removeFromSelection,
} from "./FunctionDiagram";
import {
  getStereotypeList,
  parsePrefix,
  setElementShape,
} from "./FunctionEditVars";
import { filterEquivalent } from "./FunctionEquivalents";
import {
  getElementShape,
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
} from "./FunctionGetVars";

export function getListClassNamesObject(arr: any[], i: number) {
  return {
    "top-item": i === 0 && arr.length > 1,
    "middle-item": i > 0 && i < arr.length - 1,
    "bottom-item": i > 0 && i === arr.length - 1,
  };
}

export function setDisplayLabel(id: string, languageCode: string) {
  if (WorkspaceElements[id].selectedLabel[languageCode] === "") {
    WorkspaceElements[id].selectedLabel[languageCode] =
      WorkspaceTerms[id].labels[languageCode];
  }
}

export function getDisplayLabel(id: string, languageCode: string): string {
  if (!WorkspaceElements[id].selectedLabel[languageCode])
    setDisplayLabel(id, languageCode);
  return getLabelOrBlank(WorkspaceElements[id].selectedLabel, languageCode);
}

export function getSelectedLabels(
  id: string,
  languageCode: string
): LanguageObject {
  if (languageCode in WorkspaceElements[id].selectedLabel)
    setDisplayLabel(id, languageCode);
  return WorkspaceElements[id].selectedLabel;
}

function isElementEventType(id: string) {
  return filterEquivalent(
    WorkspaceTerms[id].types,
    parsePrefix("z-sgov-pojem", "typ-události")
  );
}

export function drawGraphElement(
  elem: joint.dia.Element,
  languageCode: string,
  representation: number
) {
  if (typeof elem.id === "string") {
    const types = WorkspaceTerms[elem.id].types;
    getDisplayLabel(elem.id, languageCode);
    const label = WorkspaceElements[elem.id].selectedLabel[languageCode];
    const labels: string[] = [];
    if (AppSettings.viewStereotypes)
      getStereotypeList(types, languageCode)
        .sort((a, b) => (a in Shapes && !(b in Shapes) ? -1 : 1))
        .forEach((str) => labels.push("«" + str.toLowerCase() + "»"));
    labels.push(label === "" ? "<blank>" : label);
    elem.prop("attrs/label/text", labels.join("\n"));
    const text: string[] = [];
    if (representation === Representation.COMPACT) {
      text.push(
        ...getIntrinsicTropeTypeIDs(elem.id).map((id) =>
          getDisplayLabel(id, languageCode)
        )
      );
    }
    elem.prop("attrs/labelAttrs/text", text.join("\n"));
    if (isElementEventType(elem.id)) elem.prop("attrs/labelAttrs/x", 20);
    const width =
      representation === Representation.COMPACT
        ? Math.max(
            labels.reduce((a, b) => (a.length > b.length ? a : b), "").length *
              10 +
              4,
            text.length > 0
              ? 8 *
                  text.reduce((a, b) => (a.length > b.length ? a : b), "")
                    .length
              : 0
          )
        : labels.reduce((a, b) => (a.length > b.length ? a : b), "").length *
            10 +
          4;
    elem.prop("attrs/text/x", width / 2);
    const attrHeight = 24 + (labels.length - 1) * 18;
    const height = (text.length > 0 ? 4 + text.length * 14 : 0) + attrHeight;
    elem.prop("attrs/labelAttrs/y", attrHeight);
    setElementShape(elem, width, height);
    elem.resize(width, height);
  }
}

/**
 * Colors the cell (link or element border).
 * @param id ID of colored cell
 * @param color Color to be used
 */
export function highlightCells(
  color: keyof typeof CellColors,
  ...ids: string[]
) {
  for (const id of ids) {
    const cell = graph.getCell(id);
    if (!cell) return;
    if (cell.isLink()) {
      cell.attr(`line/filter`, {
        name: "dropShadow",
        args: {
          dx: 2,
          dy: 2,
          blur: 3,
          color: color,
        },
      });
    } else if (cell.id) {
      cell.attr(`${getElementShape(cell.id)}/filter`, {
        name: "highlight",
        args: {
          color: color,
          width: 2,
          opacity: 0.5,
          blur: 5,
        },
      });
    }
    addToSelection(id);
  }
}

export function unHighlightCells(...ids: string[]) {
  for (const id of ids) {
    const cell = graph.getCell(id);
    if (!cell) return;
    if (cell.isLink()) {
      cell.attr({ line: { filter: "none" } });
    } else if (cell.id) {
      cell.attr({
        [getElementShape(cell.id)]: {
          filter: "none",
        },
      });
    }
    removeFromSelection(id);
  }
}

export function unHighlightAll() {
  for (const cell of graph.getElements()) {
    cell.attr({
      [getElementShape(cell.id)]: {
        filter: "none",
      },
    });
  }
  for (const cell of graph.getLinks()) {
    cell.attr({ line: { filter: "none" } });
  }
  clearSelection();
}

export function redrawElement(id: string, language: string) {
  const elem = graph.getElements().find((elem) => elem.id === id);
  if (elem) {
    drawGraphElement(elem, language, AppSettings.representation);
  }
}
