import {graph} from "../graph/Graph";
import * as joint from "jointjs";
import {ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {getStereotypeList, parsePrefix, setElementShape} from "./FunctionEditVars";
import {Representation} from "../config/Enum";
import {getElementShape} from "./FunctionGetVars";
import {ElementColors} from "../config/visual/ElementColors";

export function setDisplayLabel(id: string, languageCode: string) {
	if (ProjectElements[id].selectedLabel[languageCode] === "") {
		const altLabel = VocabularyElements[ProjectElements[id].iri].altLabels.find(alt =>
			alt.language === languageCode);
		ProjectElements[id].selectedLabel[languageCode] = altLabel ? altLabel.label :
			VocabularyElements[ProjectElements[id].iri].labels[languageCode];
	}
}

export function getDisplayLabel(id: string, languageCode: string): string {
	if (!(ProjectElements[id].selectedLabel[languageCode]))
		setDisplayLabel(id, languageCode);
	return ProjectElements[id].selectedLabel[languageCode];
}

export function drawGraphElement(elem: joint.dia.Element, languageCode: string, representation: number) {
	if (typeof elem.id === "string") {
		const types = VocabularyElements[ProjectElements[elem.id].iri].types;
		setDisplayLabel(elem.id, languageCode);
		const label = ProjectElements[elem.id].selectedLabel[languageCode];
		let labels: string[] = [];
		if (ProjectSettings.viewStereotypes)
			getStereotypeList(types, languageCode).forEach((str) => labels.push("«" + str.toLowerCase() + "»"));
		labels.push(label === "" ? "<blank>" : label);
		elem.prop('attrs/label/text', labels.join("\n"));
		let text = [];
		if (representation === Representation.COMPACT) {
			for (const link in ProjectLinks) {
				if ((ProjectLinks[link].source === elem.id || ProjectLinks[link].target === elem.id) &&
					ProjectLinks[link].active) {
					if (ProjectLinks[link].iri === parsePrefix("z-sgov-pojem", "má-vlastnost") &&
						ProjectLinks[link].source === elem.id && ProjectLinks[link].active) {
						text.push(VocabularyElements[ProjectElements[ProjectLinks[link].target].iri].labels[languageCode])
					} else if (ProjectLinks[link].iri === parsePrefix("z-sgov-pojem", "je-vlastností") &&
						ProjectLinks[link].target === elem.id && ProjectLinks[link].active) {
						text.push(VocabularyElements[ProjectElements[ProjectLinks[link].source].iri].labels[languageCode])
					}
				}
			}
		}
		elem.prop("attrs/labelAttrs/text", text.join("\n"));
		const width = representation === Representation.COMPACT ?
			Math.max((labels.reduce((a, b) => a.length > b.length ? a : b, "").length * 10) + 4,
				text.length > 0 ? 8 * (text.reduce((a, b) => a.length > b.length ? a : b, "").length) : 0) :
			(labels.reduce((a, b) => a.length > b.length ? a : b, "").length * 10) + 4;
		elem.prop('attrs/text/x', width / 2);
		const attrHeight = (24 + ((labels.length - 1) * 18));
		const height = (text.length > 0 ? (4 + (text.length * 14)) : 0) +
			attrHeight;
		elem.prop('attrs/labelAttrs/y', attrHeight);
		setElementShape(elem, width, height);
		elem.resize(width, height);
	}
}

/**
 * Colors the cell (link or element border).
 * @param id ID of colored cell
 * @param color Color to be used
 */
export function highlightCell(id: string, color: string = ElementColors.detail) {
	let cell = graph.getCell(id);
	if (!cell) return;
	if (cell.isLink()) {
		cell.attr({line: {stroke: color}});
	} else if (cell.id) {
		cell.attr({[getElementShape(cell.id)]: {stroke: color}});
	}
}

export function unHighlightCell(id: string, color: string = ElementColors.default) {
	let cell = graph.getCell(id);
	if (!cell) return;
	if (cell.isLink()) {
		cell.attr({line: {stroke: color}});
	} else if (cell.id) {
		drawGraphElement(cell as joint.dia.Element, ProjectSettings.selectedLanguage, ProjectSettings.representation)
	}
}

export function unHighlightAll() {
	for (let cell of graph.getCells()) {
		if (typeof cell.id === "string") {
			unHighlightCell(cell.id);
		}
	}
}

export function unHighlightSelected(ids: string[]) {
	for (const id of ids) {
		let cell = graph.getCell(id);
		if (cell && typeof cell.id === "string") {
			unHighlightCell(cell.id);
		}
	}
}
