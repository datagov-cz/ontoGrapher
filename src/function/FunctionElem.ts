import {graph} from "../graph/Graph";
import {drawGraphElement, highlightCell, unHighlightCell} from "./FunctionDraw";
import {getElementShape} from "./FunctionGetVars";
import {paper} from "../main/DiagramCanvas";
import {PackageNode} from "../datatypes/PackageNode";
import {graphElement} from "../graph/GraphElement";
import {addClass, addVocabularyElement, createNewElemIRI} from "./FunctionCreateVars";
import {parsePrefix} from "./FunctionEditVars";
import {Diagrams, ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import * as joint from "jointjs";
import {updateProjectElementDiagram} from "../queries/UpdateElementQueries";
import {updateProjectLinkVertices} from "../queries/UpdateLinkQueries";

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

/**
 * Checks if the position of the element on the canvas differs from the position saved in the model.
 * @param elem The element to check
 */
export function isElementPositionOutdated(elem: joint.dia.Element) {
	const position = elem.position();
	const id = elem.id;
	return position.x !== ProjectElements[id].position[ProjectSettings.selectedDiagram].x ||
		position.y !== ProjectElements[id].position[ProjectSettings.selectedDiagram].y
}

/**
 * Moves elements on the canvas along with affected links (if applicable).
 * This function is to be called on a 'element:pointerup' event.
 * Returns update queries (to be pushed into the remote DB).
 * @param sourceElem ID of event source.
 * @param evt Mouse event.
 */
export function moveElements(sourceElem: joint.dia.Element, evt: JQuery.MouseUpEvent): string[] {
	// get the selection rectangle data
	const {
		rect, bbox, ox, oy
	} = evt.data;
	const sourceID = sourceElem.id as string;
	if (rect) rect.remove();
	const movedLinks: string[] = [];
	const movedElems: string[] = [sourceID];
	ProjectElements[sourceID].position[ProjectSettings.selectedDiagram] = sourceElem.position();
	for (const id of ProjectSettings.selectedElements) {
		const elem = graph.getElements().find(elem => elem.id === id);
		if (elem && id !== sourceID && bbox && ox && oy) {
			// calculate and save the new element positions
			const oldPos = elem.position();
			const diff = new joint.g.Point(bbox.x, bbox.y).difference(ox, oy);
			elem.position(oldPos.x + diff.x / Diagrams[ProjectSettings.selectedDiagram].scale,
				oldPos.y + diff.y / Diagrams[ProjectSettings.selectedDiagram].scale);
			// generate queries only if the position changed
			if (isElementPositionOutdated(elem)) {
				ProjectElements[id].position[ProjectSettings.selectedDiagram] = elem.position();
				movedElems.push(id);
				for (const link of graph.getConnectedLinks(elem)) {
					// if there are any connected links with vertices, calculate and save the new vertex positions
					const linkID = link.id as string;
					if (!(movedLinks.includes(linkID)) && link.vertices().length > 0) {
						movedLinks.push(linkID);
						link.vertices().forEach((vert, i) => {
							link.vertex(i, {
								x: vert.x + diff.x / Diagrams[ProjectSettings.selectedDiagram].scale,
								y: vert.y + diff.y / Diagrams[ProjectSettings.selectedDiagram].scale
							})
						})
						ProjectLinks[linkID].vertices[ProjectSettings.selectedDiagram] = link.vertices();
					}
				}
			}
		}
	}
	const queries: string[] = [];
	if (movedElems.length > 0)
		queries.push(updateProjectElementDiagram(ProjectSettings.selectedDiagram, ...movedElems));
	if (movedLinks.length > 0)
		queries.push(updateProjectLinkVertices(ProjectSettings.selectedDiagram, ...movedLinks));
	return queries;
}
