import {
	Prefixes,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Schemes,
	VocabularyElements
} from "../config/Variables";
import {LinkType} from "../config/Enum";
import {initConnections} from "./FunctionRestriction";
import {addRelationships} from "./FunctionEditVars";

export function constructProjectLinkLD(contextEndpoint: string, id: string): {}[] {
	let linkIRI = ProjectSettings.ontographerContext + "-" + id;
	let cardinalities: { [key: string]: string } = {};
	let vertices: { "@id": string, "@type": "og:vertex", "og:index": number, "og:position-x": number, "og:position-y": number, "og:diagram": number }[] = [];
	if (ProjectLinks[id].sourceCardinality) {
		cardinalities["og:sourceCardinality1"] = ProjectLinks[id].sourceCardinality.getFirstCardinality();
		cardinalities["og:sourceCardinality2"] = ProjectLinks[id].sourceCardinality.getSecondCardinality();
	}
	if (ProjectLinks[id].targetCardinality) {
		cardinalities["og:targetCardinality1"] = ProjectLinks[id].targetCardinality.getFirstCardinality();
		cardinalities["og:targetCardinality2"] = ProjectLinks[id].targetCardinality.getSecondCardinality();
	}
	if (ProjectLinks[id].vertices[ProjectSettings.selectedDiagram])
		ProjectLinks[id].vertices[ProjectSettings.selectedDiagram].forEach((vertex, i) => {
			vertices.push({
				"@id": linkIRI + "/diagram-" + (ProjectSettings.selectedDiagram + 1) + "/vertex-" + (i + 1),
				"@type": "og:vertex",
				"og:index": i,
				"og:diagram": ProjectSettings.selectedDiagram,
				"og:position-x": Math.round(vertex.x),
				"og:position-y": Math.round(vertex.y)
			})
		})
	return [{
		"@id": linkIRI,
		"@type": "og:link",
		"og:id": id,
		"og:context": ProjectSettings.contextIRI,
		"og:iri": ProjectLinks[id].iri,
		"og:active": ProjectLinks[id].active,
		"og:source-id": ProjectLinks[id].source,
		"og:target-id": ProjectLinks[id].target,
		"og:source": ProjectElements[ProjectLinks[id].source].iri,
		"og:target": ProjectElements[ProjectLinks[id].target].iri,
		"og:type": ProjectLinks[id].type === LinkType.DEFAULT ? "default" : "generalization",
		...cardinalities,
		"og:vertex": vertices.map(vert => vert["@id"])
	}]
}

export function updateLinks(): { add: string[], delete: string[], update: string[] } {
	let linksToPush = [...initConnections(), ...addRelationships()];
	let graph: {}[] = [];
	linksToPush.forEach(link => {
		graph.push(...constructProjectLinkLD(ProjectSettings.contextEndpoint, link));
	})
	let addLD = {
		"@context": {
			...Prefixes,
			"og:iri": {"@type": "@id"},
			"og:source": {"@type": "@id"},
			"og:target": {"@type": "@id"},
			"og:context": {"@type": "@id"},
			"og:vertex": {"@type": "@id"},
		},
		"@id": ProjectSettings.ontographerContext,
		"@graph": graph
	}
	return {add: linksToPush.length > 0 ? [JSON.stringify(addLD)] : [], delete: [], update: []};
}

export function constructProjectElementDiagramLD(contextEndpoint: string, ids: string[], diagram: number): { add: string[], delete: string[], update: string[] } {
	let graph: { [key: string]: {}[] } = {};
	ids.forEach((id) => {
		let iri = ProjectElements[id].iri;
		let scheme = VocabularyElements[iri].inScheme;
		if (!(scheme in graph))
			graph[scheme] = [];
		graph[scheme].push({
			"@id": iri + "/diagram",
			"og:diagram": iri + "/diagram-" + (diagram + 1),
		});
		graph[scheme].push({
			"@id": iri + "/diagram-" + (diagram + 1),
			"@type": "og:elementDiagram",
			"og:index": diagram,
			"og:position-x": Math.round(ProjectElements[id].position[diagram].x),
			"og:position-y": Math.round(ProjectElements[id].position[diagram].y),
			"og:hidden": ProjectElements[id].hidden[diagram]
		});
	})
	let adds: string[] = [];

	for (let scheme in graph) {
		adds.push(JSON.stringify(
			{
				"@context": {
					...Prefixes,
					"og:diagram": {"@type": "@id"},
				},
				"@id": Schemes[scheme].graph,
				"@graph": graph[scheme]
			}
		));
	}

	let updates = ids.map((id, i) =>
		`
			with <${Schemes[VocabularyElements[ProjectElements[id].iri].inScheme].graph}>
			delete{<${ProjectElements[id].iri}/diagram-${diagram + 1}> ?p${i} ?o${i}.}
			where{<${ProjectElements[id].iri}/diagram-${diagram + 1}> ?p${i} ?o${i}.};
		`
	).join("")

	return {add: adds, delete: [], update: [updates]}
}

export function constructProjectLinkVertex(ids: string[], diagram: number): { add: string[], delete: string[], update: string[] } {
	let graph: {}[] = [];
	let updates: string[] = [];
	let counter = 0;
	ids.forEach((id) => {
		let linkIRI = ProjectSettings.ontographerContext + "-" + id;
		let vertices = ProjectLinks[id].vertices[diagram];
		graph.push({
			"@id": linkIRI,
			"og:vertex":
				vertices.map((vert, i) =>
					linkIRI + "/diagram-" + (diagram + 1) + "/vertex-" + (i + 1))
		});
		graph.push(...vertices.map((vert, i) => {
			return {
				"@id": linkIRI + "/diagram-" + (diagram + 1) + "/vertex-" + (i + 1),
				"@type": "og:vertexDiagram",
				"og:index": i,
				"og:diagram": ProjectSettings.selectedDiagram,
				"og:position-x": Math.round(vert.x),
				"og:position-y": Math.round(vert.y),
			}
		}));
		updates.push(...vertices.map((vert, i) =>
			(`
				with <${ProjectSettings.ontographerContext}>
				delete{<${linkIRI}/diagram-${diagram + 1}/vertex-${i + 1}> ?p${counter} ?o${counter}.}
				where{<${linkIRI}/diagram-${diagram + 1}/vertex-${i + 1}> ?p${counter} ?o${counter++}.};
			`)
		))
	})

	let addLD = {
		"@context": {
			...Prefixes,
			"og:vertex": {"@type": "@id"},
		},
		"@id": ProjectSettings.ontographerContext,
		"@graph": graph
	};

	return {add: [JSON.stringify(addLD)], delete: [], update: [updates.join("")]}
}