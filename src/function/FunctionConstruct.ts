import {Prefixes, ProjectElements, ProjectLinks, ProjectSettings} from "../config/Variables";
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