import {
	Links,
	PackageRoot,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Schemes,
	VocabularyElements
} from "../config/Variables";
import {LinkType, Representation} from "../config/Enum";
import {
	getDefaultCardinality,
	getElementShape,
	getLinkOrVocabElem,
	getNewLink,
	getUnderlyingFullConnections
} from "./FunctionGetVars";
import {graph} from "../graph/Graph";
import * as joint from "jointjs";
import {graphElement} from "../graph/GraphElement";
import {addClass, addLink} from "./FunctionCreateVars";
import {updateProjectElement} from "../queries/UpdateElementQueries";
import {mvp1IRI, mvp2IRI, setLabels} from "./FunctionGraph";
import {paper} from "../main/DiagramCanvas";
import {updateConnections} from "../queries/UpdateConnectionQueries";
import {updateDeleteProjectLinkVertex, updateProjectLink, updateProjectLinkVertex} from "../queries/UpdateLinkQueries";

export function saveNewLink(iri: string, sid: string, tid: string): string[] {
	const type = iri in Links ? Links[iri].type : LinkType.DEFAULT;
	let link = getNewLink(type);
	link.source({id: sid, connectionPoint: {name: 'boundary', args: {selector: getElementShape(sid)}}});
	link.target({id: tid, connectionPoint: {name: 'boundary', args: {selector: getElementShape(tid)}}});
	link.addTo(graph);
	const s = link.getSourceElement();
	const t = link.getTargetElement();
	if (s && t) {
		const id = link.id as string;
		const sid = s.id as string;
		const tid = t.id as string;
		if (sid === tid) {
			const coords = link.getSourcePoint();
			const bbox = paper.findViewByModel(sid).getBBox();
			if (bbox) {
				link.vertices([
					new joint.g.Point(coords.x, coords.y + 100),
					new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y + 100),
					new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y),
				])
			}
		}
		link.source({id: sid, connectionPoint: {name: 'boundary', args: {selector: getElementShape(sid)}}});
		link.target({id: tid, connectionPoint: {name: 'boundary', args: {selector: getElementShape(tid)}}});
		let queries: string[] = []
		if (ProjectSettings.representation === Representation.FULL || type === LinkType.GENERALIZATION) {
			queries.push(...updateConnection(sid, tid, id, type, iri, true));
		} else {
			const find = Object.keys(ProjectElements).find(elem =>
				ProjectElements[elem].active && ProjectElements[elem].iri === iri);
			let property = find ? new graphElement({id: find}) : new graphElement();
			let source = getNewLink();
			let target = getNewLink();
			const sourceId = source.id as string;
			const propertyId = property.id as string;
			const targetId = target.id as string;
			const pkg = PackageRoot.children.find(pkg =>
				pkg.scheme === VocabularyElements[ProjectElements[sid].iri].inScheme) || PackageRoot;
			if (!find) addClass(propertyId, iri, pkg);
			ProjectElements[property.id].connections.push(sourceId);
			ProjectElements[property.id].connections.push(targetId);
			queries.push(updateProjectElement(true, propertyId),
				...updateConnection(propertyId, sid, sourceId, type, mvp1IRI),
				...updateConnection(propertyId, tid, targetId, type, mvp2IRI),
				...updateConnection(sid, tid, id, type, iri));
		}
		if (type === LinkType.DEFAULT)
			setLabels(link, getLinkOrVocabElem(iri).labels[ProjectSettings.selectedLanguage]);
		return queries;
	} else {
		link.remove();
		return [""];
	}
}

export function checkDefaultCardinality(link: string) {
	if (!(Links[link].defaultSourceCardinality.checkCardinalities())) {
		Links[link].defaultSourceCardinality = getDefaultCardinality();
	}
	if (!(Links[link].defaultTargetCardinality.checkCardinalities())) {
		Links[link].defaultTargetCardinality = getDefaultCardinality();
	}
}

export function updateConnection(sid: string, tid: string, linkID: string, type: number, iri: string, setCardinality: boolean = false): string[] {
	addLink(linkID, iri, sid, tid, type);
	if (iri in Links && type === LinkType.DEFAULT && setCardinality) {
		ProjectLinks[linkID].sourceCardinality =
			Links[iri].defaultSourceCardinality.isCardinalityNone() ?
				getDefaultCardinality() : Links[iri].defaultSourceCardinality;
		ProjectLinks[linkID].targetCardinality =
			Links[iri].defaultTargetCardinality.isCardinalityNone() ?
				getDefaultCardinality() : Links[iri].defaultTargetCardinality;
	}
	ProjectElements[sid].connections.push(linkID);
	return [updateConnections(linkID), updateProjectLink(true, linkID)];
}

export function updateVertices(id: string, linkVerts: joint.dia.Link.Vertex[]): string[] {
	if (!ProjectLinks[id].vertices[ProjectSettings.selectedDiagram]) ProjectLinks[id].vertices[ProjectSettings.selectedDiagram] = [];
	let update = [];
	let del = -1;
	for (let i = 0; i < Math.max(linkVerts.length, ProjectLinks[id].vertices[ProjectSettings.selectedDiagram].length); i++) {
		let projVert = ProjectLinks[id].vertices[ProjectSettings.selectedDiagram][i];
		if (projVert && !(linkVerts[i])) {
			del = i;
			break;
		} else if (!(projVert) || projVert.x !== linkVerts[i].x || projVert.y !== linkVerts[i].y) {
			ProjectLinks[id].vertices[ProjectSettings.selectedDiagram][i] = {x: linkVerts[i].x, y: linkVerts[i].y};
			update.push(i);
		}
	}
	let queries = [updateProjectLinkVertex(id, update, ProjectSettings.selectedDiagram)];
	if (del !== -1) queries.push(
		updateDeleteProjectLinkVertex(id, del,
			ProjectLinks[id].vertices[ProjectSettings.selectedDiagram].length, ProjectSettings.selectedDiagram))
	ProjectLinks[id].vertices[ProjectSettings.selectedDiagram] = linkVerts;
	return queries;
}

export function deleteConnections(sid: string, id: string): string {
	ProjectLinks[id].active = false;
	if (graph.getCell(id)) graph.getCell(id).remove();
	return updateProjectLink(true, id);
}

export function addLinkTools(linkView: joint.dia.LinkView, transaction: Function, update: Function) {
	const id = linkView.model.id as string;
	const verticesTool = new joint.linkTools.Vertices({stopPropagation: false});
	const segmentsTool = new joint.linkTools.Segments({stopPropagation: false});
	const removeButton = new joint.linkTools.Remove({
		distance: 5,
		action: ((evt, view) => {
			if (ProjectSettings.representation === Representation.FULL) {
				const sid = view.model.getSourceCell()?.id as string;
				let queries = [deleteConnections(sid, id)];
				const compactConn = Object.keys(ProjectLinks).find(link => ProjectLinks[link].active &&
					ProjectLinks[link].iri === ProjectElements[ProjectLinks[id].source].iri &&
					ProjectLinks[link].target === ProjectLinks[id].target);
				if (compactConn) {
					queries.push(deleteConnections(ProjectLinks[compactConn].source, compactConn));
				}
				transaction(...queries);
			} else {
				let deleteLinks = getUnderlyingFullConnections(view.model);
				let queries: string[] = []
				if (deleteLinks && ProjectLinks[deleteLinks.src] && ProjectLinks[deleteLinks.tgt]) {
					ProjectLinks[deleteLinks.src].active = false;
					ProjectLinks[deleteLinks.tgt].active = false;
					queries.push(
						deleteConnections(ProjectLinks[deleteLinks.src].source, deleteLinks.src),
						deleteConnections(ProjectLinks[deleteLinks.src].source, deleteLinks.tgt));
				}
				const sid = view.model.getSourceCell()?.id as string;
				queries.push(deleteConnections(sid, id));
				view.model.remove();
				ProjectLinks[view.model.id].active = false;
				update();
				ProjectSettings.selectedLink = "";
				transaction(...queries);
			}
		})
	})
	let readOnly = (Schemes[VocabularyElements[ProjectElements[ProjectLinks[id].source].iri].inScheme].readOnly);
	let tools = [verticesTool, segmentsTool]
	if (!readOnly) tools.push(removeButton);
	let toolsView = new joint.dia.ToolsView({
		tools: tools
	});
	linkView.addTools(toolsView);
}