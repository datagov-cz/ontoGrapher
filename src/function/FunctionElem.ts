import {graph} from "../graph/Graph";
import {drawGraphElement, highlightCell, unHighlightCell} from "./FunctionDraw";
import {getElementShape} from "./FunctionGetVars";
import {paper} from "../main/DiagramCanvas";
import {PackageNode} from "../datatypes/PackageNode";
import {graphElement} from "../graph/GraphElement";
import {addClass, addVocabularyElement, createNewElemIRI} from "./FunctionCreateVars";
import {parsePrefix} from "./FunctionEditVars";
import {ProjectElements, ProjectSettings, VocabularyElements} from "../config/Variables";

export function resizeElem(id: string) {
	let view = paper.findViewByModel(id);
	if (view) {
		let bbox = view.getBBox();
		let cell = graph.getCell(id);
		let links = graph.getConnectedLinks(cell);
		for (let link of links) {
			if (link.getSourceCell()?.id === id) {
				link.source({x: bbox.x, y: bbox.y});
			} else {
				link.target({x: bbox.x, y: bbox.y});
			}
		}
		if (typeof cell.id === "string") {
			unHighlightCell(cell.id)
			highlightCell(cell.id);
		}
		for (let link of links) {
			if (link.getSourceCell() === null) {
				link.source({id: id, connectionPoint: {name: 'boundary', args: {selector: getElementShape(id)}}});
			} else {
				link.target({id: id, connectionPoint: {name: 'boundary', args: {selector: getElementShape(id)}}});
			}
		}
	}
}

export function createNewConcept(point: { x: number, y: number }, name: { [key: string]: string }, language: string, pkg: PackageNode) {
	let cls = new graphElement();
	let p = paper.clientToLocalPoint(point);
	let id = cls.id as string;
	let iri = createNewElemIRI(pkg.scheme, name[language]);
	addVocabularyElement(iri, pkg.scheme, [parsePrefix("skos", "Concept")]);
	addClass(id, iri, pkg);
	ProjectElements[cls.id].hidden[ProjectSettings.selectedDiagram] = false;
	if (p) {
		cls.set('position', {x: p.x, y: p.y});
		ProjectElements[cls.id].position[ProjectSettings.selectedDiagram] = {x: p.x, y: p.y};
	}
	VocabularyElements[iri].labels = name;
	cls.addTo(graph);
	let bbox = paper.findViewByModel(cls).getBBox();
	if (bbox) cls.resize(bbox.width, bbox.height);
	drawGraphElement(cls, language, ProjectSettings.representation);
	return id;
}

export function getElementToolPosition(id: string | number, topRight: boolean = false): { x: number | string, y: number | string } {
	switch (getElementShape(id)) {
		case "bodyEllipse":
			return topRight ? {x: '85%', y: '15%'} : {x: '15%', y: '15%'};
		case "bodyTrapezoid":
			return topRight ? {x: '100%', y: 0} : {x: 20, y: 0};
		case "bodyDiamond":
			return topRight ? {x: '75%', y: '25%'} : {x: '25%', y: '25%'};
		case "bodyBox":
			return topRight ? {x: '100%', y: 0} : {x: 0, y: 0};
		default:
			return topRight ? {x: '100%', y: 0} : {x: 0, y: 0};
	}
}