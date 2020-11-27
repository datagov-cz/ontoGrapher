import {graph} from "../graph/Graph";
import * as joint from "jointjs";
import {ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {getStereotypeList, parsePrefix, setElementShape} from "./FunctionEditVars";
import {Representation} from "../config/Enum";
import {getElementShape} from "./FunctionGetVars";

export function drawGraphElement(elem: joint.dia.Element, languageCode: string, representation: number) {
	if (typeof elem.id === "string") {
		let types = VocabularyElements[ProjectElements[elem.id].iri].types;
		if (ProjectElements[elem.id].selectedLabel[languageCode] === "") {
			let altLabel = VocabularyElements[ProjectElements[elem.id].iri].altLabels.find(alt =>
				alt.language === languageCode);
			ProjectElements[elem.id].selectedLabel[languageCode] = altLabel ? altLabel.label :
				VocabularyElements[ProjectElements[elem.id].iri].labels[languageCode];
		}
		let label = ProjectElements[elem.id].selectedLabel[languageCode];
		let labels: string[] = [];
		if (ProjectSettings.viewStereotypes)
			getStereotypeList(types, languageCode).forEach((str) => labels.push("«" + str.toLowerCase() + "»"));
		labels.push(label === "" ? "<blank>" : label);
		elem.prop('attrs/label/text', labels.join("\n"));
		let text = [];
		if (representation === Representation.COMPACT) {
			for (let link in ProjectLinks) {
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
		let width = representation === Representation.COMPACT ?
			Math.max((labels.reduce((a, b) => a.length > b.length ? a : b, "").length * 10) + 4,
				text.length > 0 ? 8 * (text.reduce((a, b) => a.length > b.length ? a : b, "").length) : 0) :
			(labels.reduce((a, b) => a.length > b.length ? a : b, "").length * 10) + 4;
		elem.prop('attrs/text/x', width / 2);
		let attrHeight = (24 + ((labels.length - 1) * 18));
		let height = (text.length > 0 ? (4 + (text.length * 14)) : 0) +
			attrHeight;
		elem.prop('attrs/labelAttrs/y', attrHeight);
		setElementShape(elem, width, height);
		elem.resize(width, height);
	}
}

export function highlightCell(id: string, color: string = '#0000FF') {
	let cell = graph.getCell(id);
	if (cell.isLink()) {
		cell.attr({line: {stroke: color}});
	} else {
		if (cell.id) cell.attr({[getElementShape(cell.id)]: {stroke: color}});
	}
}

export function unHighlightCell(id: string, color: string = '#000000') {
	let cell = graph.getCell(id);
	if (cell.isLink()) {
		cell.attr({line: {stroke: color}});
	} else {
		if (cell.id) {
			drawGraphElement(cell as joint.dia.Element, ProjectSettings.selectedLanguage, ProjectSettings.representation)
		}
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
	for (let id of ids) {
		let cell = graph.getCell(id);
		if (cell && typeof cell.id === "string") {
			unHighlightCell(cell.id);
		}
	}
}