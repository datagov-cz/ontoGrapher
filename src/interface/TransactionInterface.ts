import {
	Diagrams,
	Prefixes,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Schemes,
	VocabularyElements
} from "../config/Variables";
import {LinkConfig} from "../config/LinkConfig";
import {constructProjectLinkLD} from "../function/FunctionConstruct";
import {RestrictionObject} from "../datatypes/RestrictionObject";
import {ConnectionObject} from "../datatypes/ConnectionObject";

export function updateProjectElement(
	oldVocabularyElement:
		{
			labels: { [key: string]: string },
			altLabels: { label: string, language: string }[]
			definitions: { [key: string]: string },
			inScheme: string,
			domain: string | undefined,
			range: string | undefined,
			types: string[],
			subClassOf: string[],
			restrictions: RestrictionObject[],
			connections: ConnectionObject[],
			active: boolean,
			topConcept: string | undefined
		},
	id: string): { add: string[], delete: string[], update: string[] } {
	let iri = ProjectElements[id].iri;
	let scheme = VocabularyElements[iri].inScheme;
	let newVocabularyElement = VocabularyElements[iri];

	let oldAltLabels = [];
	for (let alt of oldVocabularyElement.altLabels) {
		oldAltLabels.push({
			"@value": alt.label,
			"@language": alt.language
		});
	}

	let addLD: { [key: string]: any } = {
		"@context": {
			...Prefixes,
			"skos:inScheme": {"@type": "@id"},
			"og:diagram": {"@type": "@id"},
			"og:attribute": {"@type": "@id"},
			"og:property": {"@type": "@id"},
			"og:iri": {"@type": "@id"},
			"og:context": {"@type": "@id"},
			"http://www.w3.org/2002/07/owl#onProperty": {"@type": "@id"},
			"skos:hasTopConcept": {"@type": "@id"},
		},
		"@id": Schemes[scheme].graph,
		"@graph": [
			{
				"@id": iri,
				"@type": newVocabularyElement.types,
				"skos:prefLabel": Object.keys(newVocabularyElement.labels)
					.filter((lang: string) => newVocabularyElement.labels[lang]).map((lang: string) => {
						return {"@value": newVocabularyElement.labels[lang], "@language": lang}
					}),
				"skos:altLabel": newVocabularyElement.altLabels.map(alt => {
					return {"@value": alt.label, "@language": alt.language}
				}),
				"skos:definition": Object.keys(newVocabularyElement.definitions)
					.filter((lang) => newVocabularyElement.definitions[lang]).map((lang: string) => {
						return {"@value": newVocabularyElement.definitions[lang], "@language": lang}
					}),
				"skos:inScheme": scheme,
			},
			{
				"@id": iri + "/diagram",
				"@type": "og:element",
				"og:context": ProjectSettings.contextIRI,
				"og:id": id,
				"og:iri": iri,
				"og:name": Object.keys(ProjectElements[id].selectedLabel).map((lang: string) => {
					return {"@value": ProjectElements[id].selectedLabel[lang], "@language": lang}
				}),
				"og:diagram": ProjectElements[id].diagrams.map((diag) => (iri + "/diagram-" + (diag + 1))),
				"og:active": ProjectElements[id].active,
			}
		]
	}

	if (newVocabularyElement.topConcept) addLD["@graph"].push({
		"@id": scheme,
		"skos:hasTopConcept": iri
	});

	let deleteLD = {
		"@context": {
			...Prefixes,
			"skos:inScheme": {"@type": "@id"},
			"og:diagram": {"@type": "@id"},
			"og:attribute": {"@type": "@id"},
			"og:property": {"@type": "@id"},
			"og:iri": {"@type": "@id"},
			"owl:onProperty": {"@type": "@id"}
		},
		"@id": Schemes[scheme].graph,
		"@graph": [
			{
				"@id": iri,
				"@type": oldVocabularyElement.types,
				"skos:prefLabel": Object.keys(oldVocabularyElement.labels).map(lang => {
					return {
						"@value": oldVocabularyElement.labels[lang],
						"@language": lang
					}
				}),
				"skos:definition": Object.keys(oldVocabularyElement.definitions).map(lang => {
					return {
						"@value": oldVocabularyElement.definitions[lang],
						"@language": lang
					}
				}),
				"skos:altLabel": oldAltLabels
			}
		]
	}

	let updateStrings: string[] = updateDeleteTriples(iri + "/diagram", Schemes[scheme].graph, false, false)
	return {add: [JSON.stringify(addLD)], delete: [JSON.stringify(deleteLD)], update: updateStrings}
}

export function updateProjectElementDiagram(id: string, diagram: number, oldPosition: { x: number, y: number }, oldHidden: boolean):
	{ add: string[], delete: string[], update: string[] } {

	let iri = ProjectElements[id].iri;
	let scheme = VocabularyElements[iri].inScheme;

	let addLD = {
		"@context": {
			...Prefixes,
			"og:diagram": {"@type": "@id"},
		},
		"@id": Schemes[scheme].graph,
		"@graph": [
			{
				"@id": iri + "/diagram",
				"og:diagram": iri + "/diagram-" + (diagram + 1),
			},
			{
				"@id": iri + "/diagram-" + (diagram + 1),
				"@type": "og:elementDiagram",
				"og:index": diagram,
				"og:position-x": Math.round(ProjectElements[id].position[diagram].x),
				"og:position-y": Math.round(ProjectElements[id].position[diagram].y),
				"og:hidden": ProjectElements[id].hidden[diagram]
			}
		]
	}

	if (!oldPosition && oldHidden === undefined)
		return {add: [JSON.stringify(addLD)], delete: [], update: []}

	let deleteLD = {
		"@context": {
			...Prefixes,
			"og:diagram": {"@type": "@id"},
		},
		"@id": Schemes[scheme].graph,
		"@graph": [
			{
				"@id": iri + "/diagram",
				"og:diagram": iri + "/diagram-" + (diagram + 1),
			},
			{
				"@id": iri + "/diagram-" + (diagram + 1),
				"@type": "og:elementDiagram",
				"og:index": diagram,
				"og:position-x": oldPosition ? oldPosition.x : 0,
				"og:position-y": oldPosition ? oldPosition.y : 0,
				"og:hidden": oldHidden
			}
		]
	}

	return {add: [JSON.stringify(addLD)], delete: [JSON.stringify(deleteLD)], update: []}
}

export function updateProjectLinkVertex(id: string, vertices: number[], oldVertices: { [key: number]: { x: number, y: number } }): { add: string[], delete: string[], update: string[] } {

	let linkIRI = ProjectSettings.ontographerContext + "-" + id;

	let addLD: { [key: string]: any } = {
		"@context": {
			...Prefixes,
			"og:vertex": {"@type": "@id"},
		},
		"@id": ProjectSettings.ontographerContext,
		"@graph": [
			{
				"@id": linkIRI,
				"og:vertex": vertices.map(i => linkIRI + "/diagram-" + (ProjectSettings.selectedDiagram + 1) + "/vertex-" + (i + 1))
			}
		]
	}

	for (let i of vertices) {
		addLD["@graph"].push({
			"@id": linkIRI + "/diagram-" + (ProjectSettings.selectedDiagram + 1) + "/vertex-" + (i + 1),
			"@type": "og:vertexDiagram",
			"og:index": i,
			"og:diagram": ProjectSettings.selectedDiagram,
			"og:position-x": Math.round(ProjectLinks[id].vertices[ProjectSettings.selectedDiagram][i].x),
			"og:position-y": Math.round(ProjectLinks[id].vertices[ProjectSettings.selectedDiagram][i].y),
		})
	}

	let deleteLD: { [key: string]: any } = {
		"@context": {
			...Prefixes,
			"og:vertex": {"@type": "@id"},
		},
		"@id": ProjectSettings.ontographerContext,
		"@graph": [
			{
				"@id": linkIRI,
				"og:vertex": Object.keys(oldVertices).map((i) => linkIRI + "/diagram-" + (ProjectSettings.selectedDiagram + 1) + "/vertex-" + (parseInt(i, 10) + 1)).concat(
					Object.keys(oldVertices).map(i => linkIRI + "/vertex-" + (i + 1))
				)
			}
		]
	}

	for (let i in oldVertices) {
		deleteLD["@graph"].push({
			"@id": (linkIRI + "/diagram-" + (ProjectSettings.selectedDiagram + 1) + "/vertex-" + (parseInt(i, 10) + 1)),
			"og:index": i,
			"og:diagram": ProjectSettings.selectedDiagram,
			"og:position-x": oldVertices[i].x,
			"og:position-y": oldVertices[i].y,
		})
		deleteLD["@graph"].push({
			"@id": (linkIRI + "/vertex-" + (parseInt(i, 10) + 1)),
			"og:index": i,
			"og:diagram": ProjectSettings.selectedDiagram,
			"og:position-x": oldVertices[i].x,
			"og:position-y": oldVertices[i].y,
		})
	}

	return {add: [JSON.stringify(addLD)], delete: [JSON.stringify(deleteLD)], update: []}
}

export function updateDeleteProjectLinkVertex(id: string, from: number, to: number): { add: string[], delete: string[], update: string[] } {
	let linkIRI = ProjectSettings.ontographerContext + "-" + id;
	let vars = [];

	for (let i = from; i < to; i++) {
		vars.push(i);
	}

	let delLD = {
		"@context": {
			...Prefixes,
			"og:vertex": {"@type": "@id"},
		},
		"@id": ProjectSettings.ontographerContext,
		"@graph": [
			{
				"@id": linkIRI,
				"og:vertex": vars.map(i => (linkIRI + "/diagram-" + (ProjectSettings.selectedDiagram + 1) + "/vertex-" + (i + 1)))
					.concat(vars.map(i => (linkIRI + "/vertex-" + (i + 1))))
			}
		]
	};

	return {add: [], delete: [JSON.stringify(delLD)], update: []}
}

export function updateProjectLink(id: string): { add: string[], delete: string[], update: string[] } {
	let linkIRI = ProjectSettings.ontographerContext + "-" + id;

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
		"@graph": [...constructProjectLinkLD(ProjectSettings.contextEndpoint, id)]
	}

	let addStrings: string[] = [JSON.stringify(addLD)];
	let updString: string[] = updateDeleteTriples(linkIRI, ProjectSettings.ontographerContext, false, false);

	return {add: addStrings, delete: [], update: updString};
}

export function mergeTransactions(
	...transactions: { add: string[], delete: string[], update: string[] }[]):
	{ add: string[], delete: string[], update: string[] } {
	let add: string[] = [];
	let del: string[] = [];
	let upd: string[] = [];
	transactions.forEach(t => {
		add = add.concat(t.add);
		del = del.concat(t.delete);
		upd = upd.concat(t.update);
	})
	return {
		add: add,
		delete: del,
		update: upd
	}
}

export function updateDeleteTriples(iri: string, context: string, bNodesFirst: boolean = false, removeObjects: boolean = true): string[] {
	let queries: string[] = [[
		"with <" + context + "> delete {",
		"<" + iri + "> ?p ?o.",
		"} where {",
		"<" + iri + "> ?p ?o.",
		"}"
	].join(" ")];
	if (removeObjects) queries.push([
		"with <" + context + "> delete {",
		"?s ?p <" + iri + ">.",
		"} where {",
		"?s ?p <" + iri + ">.",
		"}"
	].join(" "));
	if (bNodesFirst) queries.unshift([
		"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
		"PREFIX owl: <http://www.w3.org/2002/07/owl#>",
		"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
		"with <" + context + ">",
		"delete {",
		"<" + iri + "> rdfs:subClassOf ?b.",
		"?b ?p ?o.",
		"} where {",
		"<" + iri + "> rdfs:subClassOf ?b.",
		"filter(isBlank(?b)).",
		"?b ?p ?o.",
		"}"
	].join(" "));
	return queries;
}

export function updateConnections(id: string) {

	return {
		"add": [],
		"delete": [],
		"update": LinkConfig[ProjectLinks[id].type].update(id)
	};
}

export async function processTransaction(contextEndpoint: string, transactions: { add: string[], delete: string[], update: string[] }): Promise<boolean> {
	if (transactions.add.length === 0 && transactions.delete.length === 0 && transactions.update.length === 0)
		return true;
	ProjectSettings.lastTransaction = transactions;
	let miliseconds = 30000;
	let controller = new AbortController();
	const signal = controller.signal;
	let timeout = window.setTimeout(() => controller.abort(), miliseconds);

	let transactionUrl = contextEndpoint + "/transactions";

	const transactionID = await fetch(transactionUrl, {
		method: "POST",
		signal
	}).then(response => response.headers).then(
		headers => {
			let location = headers.get("location");
			if (location) return location;
			else return undefined;
		}
	).catch(() => undefined);

	if (transactionID) {
		ProjectSettings.lastTransactionID = transactionID;

		for (let upd of transactions.update) {
			if (upd) {
				window.clearTimeout(timeout);
				timeout = window.setTimeout(() => {
					controller.abort();
					abortTransaction(transactionID);
				}, miliseconds);
				let resultUpdate = await fetch(transactionID + "?action=UPDATE", {
					headers: {
						'Content-Type': 'application/sparql-update'
					},
					method: "PUT",
					body: upd,
					signal
				}).then(response => response.ok).catch(() => false);
				if (!resultUpdate) {
					console.log(upd);
					await abortTransaction(transactionID);
					return false;
				}
			}
		}

		for (let del of transactions.delete) {
			if (del) {
				window.clearTimeout(timeout);
				timeout = window.setTimeout(() => {
					controller.abort();
					abortTransaction(transactionID);
				}, miliseconds);
				let resultDelete = await fetch(transactionID + "?action=DELETE", {
					headers: {
						'Content-Type': 'application/ld+json'
					},
					method: "PUT",
					body: del,
					signal
				}).then(response => response.ok).catch(() => false);
				if (!resultDelete) {
					console.log(del);
					await abortTransaction(transactionID);
					return false;
				}
			}
		}

		for (let add of transactions.add) {
			if (add) {
				window.clearTimeout(timeout);
				timeout = window.setTimeout(() => {
					controller.abort();
					abortTransaction(transactionID);
				}, miliseconds);
				let resultAdd = await fetch(transactionID + "?action=ADD", {
					headers: {
						'Content-Type': 'application/ld+json'
					},
					method: "PUT",
					body: add,
					signal
				}).then(response => response.ok).catch(() => false);
				if (!resultAdd) {
					console.log(add);
					await abortTransaction(transactionID);
					return false;
				}
			}
		}

		window.clearTimeout(timeout);
		timeout = window.setTimeout(() => {
			controller.abort();
			abortTransaction(transactionID);
		}, miliseconds);
		let resultCommit = await fetch(transactionID + "?action=COMMIT", {
			method: "PUT",
			signal
		}).then(response => response.ok).catch(() => false);
		if (resultCommit) {
			window.clearTimeout(timeout);
			ProjectSettings.lastTransactionID = "";
			return true;
		} else {
			await abortTransaction(transactionID);
			return false;
		}
	} else return false;
}

export async function abortTransaction(transaction: string) {
	return await fetch(transaction, {
		method: "DELETE",
		keepalive: true
	}).then(response => {
		ProjectSettings.lastTransactionID = "";
		return response.ok;
	}).catch(() => false);
}

export function updateProjectSettings(contextIRI: string): { add: string[], delete: string[], update: string[] } {

	let contextInstance = ProjectSettings.contextIRI.substring(ProjectSettings.contextIRI.lastIndexOf("/"));

	let addLD = {
		"@context": {
			...Prefixes,
			"og:diagram": {"@type": "@id"},
			"d-sgov-pracovní-prostor-pojem:aplikační-kontext": {"@type": "@id"},
			"og:context": {"@type": "@id"}
		},
		"@id": ProjectSettings.ontographerContext,
		"@graph": [
			{
				"@id": ProjectSettings.ontographerContext + contextInstance,
				"og:context": contextIRI,
				"og:viewColor": ProjectSettings.viewColorPool,
				"og:diagram": Diagrams.map((diag, i) =>
					ProjectSettings.ontographerContext + contextInstance + "/diagram-" + (i + 1))
			},
			...(Diagrams).filter(diag => diag.active).map((diag, i) => {
				return {
					"@id": ProjectSettings.ontographerContext + contextInstance + "/diagram-" + (i + 1),
					"og:index": i,
					"og:context": contextIRI,
					"og:name": diag.name,
				}
			})
		]
	}

	let addStrings = [JSON.stringify(addLD)];
	let updStrings: string[] = [];
	updStrings.push(
		...updateDeleteTriples(ProjectSettings.ontographerContext + contextInstance,
			ProjectSettings.ontographerContext, false, false));

	for (let i = 0; i < (Diagrams.length + 1); i++) {
		updStrings.push(
			...updateDeleteTriples(ProjectSettings.ontographerContext + contextInstance + "/diagram-" + (i + 1),
				ProjectSettings.ontographerContext, false, false));
	}

	return {add: addStrings, delete: [], update: updStrings};
}