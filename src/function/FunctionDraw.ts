import { graph } from "../graph/Graph";
import * as joint from "jointjs";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
} from "../config/Variables";
import { getStereotypeList, setElementShape } from "./FunctionEditVars";
import { Representation } from "../config/Enum";
import {
  getElementShape,
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
} from "./FunctionGetVars";
import { ElementColors } from "../config/visual/ElementColors";
import _ from "underscore";

export function setDisplayLabel(id: string, languageCode: string) {
  if (WorkspaceElements[id].selectedLabel[languageCode] === "") {
    const altLabel = WorkspaceTerms[id].altLabels.find(
      (alt) => alt.language === languageCode
    );
    WorkspaceElements[id].selectedLabel[languageCode] = altLabel
      ? altLabel.label
      : WorkspaceTerms[id].labels[languageCode];
  }
}

export function getDisplayLabel(id: string, languageCode: string): string {
  if (!WorkspaceElements[id].selectedLabel[languageCode])
    setDisplayLabel(id, languageCode);
  return getLabelOrBlank(WorkspaceElements[id].selectedLabel, languageCode);
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
      getStereotypeList(types, languageCode).forEach((str) =>
        labels.push("«" + str.toLowerCase() + "»")
      );
    labels.push(label === "" ? "<blank>" : label);
    elem.prop("attrs/label/text", labels.join("\n"));
    const text: string[] = [];
    if (representation === Representation.COMPACT) {
      text.push(
        ..._.uniq(getIntrinsicTropeTypeIDs(elem.id)).map((id) =>
          getDisplayLabel(id, languageCode)
        )
      );
    }
    elem.prop("attrs/labelAttrs/text", text.join("\n"));
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
export function highlightCell(
  id: string,
  color: string = ElementColors.detail
) {
  const cell = graph.getCell(id);
  if (!cell) return;
  if (cell.isLink()) {
    cell.attr({ line: { stroke: color } });
  } else if (cell.id) {
    cell.attr({ [getElementShape(cell.id)]: { stroke: color } });
  }
}

export function unHighlightCell(
  id: string,
  color: string = ElementColors.default
) {
  const cell = graph.getCell(id);
  if (!cell) return;
  if (cell.isLink()) {
    cell.attr({ line: { stroke: color } });
  } else if (cell.id) {
    drawGraphElement(
      cell as joint.dia.Element,
      AppSettings.canvasLanguage,
      AppSettings.representation
    );
  }
}

export function unHighlightAll() {
  for (let cell of graph.getElements()) {
    cell.attr({
      [getElementShape(cell.id)]: { stroke: ElementColors.default },
    });
  }
  for (let cell of graph.getLinks()) {
    cell.attr({ line: { stroke: ElementColors.default } });
  }
}

export function unHighlightSelected(ids: string[]) {
  for (const id of ids) {
    const cell = graph.getCell(id);
    if (cell && typeof cell.id === "string") {
      unHighlightCell(cell.id);
    }
  }
}

export function redrawElement(id: string, language: string) {
  const elem = graph.getElements().find((elem) => elem.id === id);
  if (elem) {
    drawGraphElement(elem, language, AppSettings.representation);
  }
}
