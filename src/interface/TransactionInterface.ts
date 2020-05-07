import {
	Diagrams,
	Prefixes,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Schemes,
	VocabularyElements
} from "../config/Variables";
import {AttributeObject} from "../datatypes/AttributeObject";

//TODO: implement loading og things
//TODO: implement retry function
//TODO: package modal not showing labels properly
//TODO: implement saving links

export async function updateProjectElement(
	contextEndpoint: string,
	newTypes: string[],
	newLabels: { [key: string]: string },
	newDefinitions: { [key: string]: string },
	newAttributes: AttributeObject[],
	newProperties: AttributeObject[],
	id: string): Promise<boolean> {

	let iri = ProjectElements[id].iri;
	let scheme = VocabularyElements[iri].inScheme;
	let delTypes = VocabularyElements[iri].types;

	let addDefinitions: { "@value": string, "@language": string }[] = [];
	let addLabels: { "@value": string, "@language": string }[] = [];

	Object.keys(newLabels).forEach((lang) => {
		if (newLabels[lang] !== "") addLabels.push({"@value": newLabels[lang], "@language": lang});
	})
	Object.keys(newDefinitions).forEach((lang) => {
		if (newDefinitions[lang] !== "") addDefinitions.push({"@value": newDefinitions[lang], "@language": lang});
	})

	let addLD = {
		"@context": Prefixes,
		"@id": Schemes[scheme].graph,
		"@graph": [
			{
				"@id": iri,
				"@type": newTypes,
				"skos:prefLabel": addLabels,
				"skos:definition": addDefinitions,
				"skos:inScheme": scheme
			},
			{
				"@id": iri + "/diagram",
				"@type": "og:element",
				"og:id": id,
				"og:untitled": ProjectElements[id].untitled,
				"og:attribute": newAttributes.map((attr, i) => (iri + "/attribute-" + (i + 1))),
				"og:property": newProperties.map((attr, i) => (iri + "/property-" + (i + 1))),
				"og:diagram": ProjectElements[id].diagrams.map((diag) => (iri + "/diagram-" + (diag + 1))),
				"og:active": ProjectElements[id].active,
			},
			...ProjectElements[id].diagrams.map(diag => {
				return {
					"@id": iri + "/diagram-" + (diag + 1),
					"@type": "og:elementDiagram",
					"og:position-x": ProjectElements[id].position[diag].x,
					"og:position-y": ProjectElements[id].position[diag].y,
					"og:hidden": ProjectElements[id].hidden[diag]
				}
			}),
			...newAttributes.map((attr, i) => {
				return {
					"@id": iri + "/attribute-" + (i + 1),
					"@type": "ex:attribute",
					"og:attribute-name": attr.name,
					"og:attribute-type": attr.type
				}
			}),
			...newProperties.map((attr, i) => {
				return {
					"@id": iri + "/property-" + (i + 1),
					"@type": "ex:property",
					"og:attribute-name": attr.name,
					"og:attribute-type": attr.type
				}
			}),
		]
	}

	let deleteLD = {
		"@context": Prefixes,
		"@id": Schemes[scheme].graph,
		"@graph": [
			{
				"@id": iri,
				"@type": delTypes,
				"skos:prefLabel": Object.keys(VocabularyElements[iri].labels).map(lang => {
					return {
						"@value": VocabularyElements[iri].labels[lang],
						"@language": lang
					}
				}),
				"skos:definition": Object.keys(VocabularyElements[iri].definitions).map(lang => {
					return {
						"@value": VocabularyElements[iri].definitions[lang],
						"@language": lang
					}
				}),
				"skos:inScheme": scheme,
			},
			...ProjectElements[id].attributes.map((attr, i) => {
				return {"@id": iri + "/attribute-" + (i + 1)}
			}),
			...ProjectElements[id].properties.map((attr, i) => {
				return {"@id": iri + "/attribute-" + (i + 1)}
			}),
			...ProjectElements[id].diagrams.map(diag => {
				return {"@id": iri + "/diagram-" + (diag + 1)}
			}),
		]
	}
	return await processTransaction(contextEndpoint, {"add": addLD, "delete": deleteLD, id: id});
}

export async function updateDeleteProjectElement(contextEndpoint: string, id: string) {
	let iri = ProjectElements[id].iri;
	let scheme = VocabularyElements[iri].inScheme;
	let subjectLD = await processGetTransaction(contextEndpoint, {subject: iri});
	let predicateLD = await processGetTransaction(contextEndpoint, {predicate: iri});
	let objectLD = await processGetTransaction(contextEndpoint, {object: iri});
	if (subjectLD && predicateLD && objectLD) {
		subjectLD = JSON.parse(subjectLD);
		predicateLD = JSON.parse(predicateLD);
		objectLD = JSON.parse(objectLD);
		return await processTransaction(contextEndpoint, {"delete": subjectLD, id: id}) &&
			await processTransaction(contextEndpoint, {"delete": predicateLD, id: id}) &&
			await processTransaction(contextEndpoint, {"delete": objectLD, id: id});
	} else return false;

}

export async function updateConnections(contextEndpoint: string, id: string, del: string[]) {
	let iri = ProjectElements[id].iri;
	let scheme = VocabularyElements[iri].inScheme;
	let connections: { [key: string]: string } = {};
	let delConnections: { [key: string]: string } = {};
	let connectionContext: { [key: string]: any } = {};

	ProjectElements[id].connections.forEach((linkID) => {
		connections[ProjectLinks[linkID].iri] = ProjectElements[ProjectLinks[linkID].target].iri
		connectionContext[ProjectLinks[linkID].iri] = {"@type": "@id"}
	})

	del.forEach((linkID) => {
		connectionContext[ProjectLinks[linkID].iri] = {"@type": "@id"}
		delConnections[ProjectLinks[linkID].iri] = ProjectElements[ProjectLinks[linkID].target].iri
	})

	let deleteLD = {
		"@context": {...Prefixes, ...connectionContext},
		"@id": Schemes[scheme].graph,
		"@graph": [
			{
				"@id": iri,
				...delConnections
			}
		]
	}

	let addLD = {
		"@context": {...Prefixes, ...connectionContext},
		"@id": Schemes[scheme].graph,
		"@graph": [
			{
				"@id": iri,
				...connections
			}
		]
	};

	return await processTransaction(contextEndpoint, {"add": addLD, "delete": deleteLD, id: id});
}

export async function getTransactionID(contextEndpoint: string) {
	return new Promise(async (resolve, reject) => {
		let transactionUrl = contextEndpoint + "/transactions";
		await fetch(transactionUrl, {
			headers: {
				'Content-Type': 'application/json'
			},
			method: "POST"
		}).then(response => response.headers).then(
			headers => resolve(headers.get("location"))
		).catch(() => {
			reject();
		});
	})
}

export async function processGetTransaction(contextEndpoint: string, request: { subject?: string, predicate?: string, object?: string }) {
	const transactionID = await getTransactionID(contextEndpoint);

	if (transactionID) {
		let transactionUrl = transactionID + "?action=GET" +
			(request.subject ? "&subj=" + "<" + (request.subject) + ">" : "") +
			(request.predicate ? "&pred=" + "<" + (request.predicate) + ">" : "") +
			(request.object ? "&obj=" + "<" + (request.object) + ">" : "");
		return await fetch(transactionUrl, {
			headers: {'Accept': "application/ld+json"},
			method: "PUT"
		}).then(response => response.text());
	}
}

export async function processTransaction(contextEndpoint: string, transactions: { [key: string]: any }): Promise<boolean> {
	ProjectSettings.lastUpdate = transactions;

	let result = false;

	const transactionID = await getTransactionID(contextEndpoint);


	if (transactionID) {
		let resultAdd, resultDelete, resultCommit;
		if (transactions.delete) {
			resultDelete = await fetch(transactionID + "?action=DELETE", {
				headers: {
					'Content-Type': 'application/ld+json'
				},
				method: "PUT",
				body: JSON.stringify(transactions.delete)
			}).then(response => response.status)
		}
		if (transactions.add) {
			resultAdd = await fetch(transactionID + "?action=ADD", {
				headers: {
					'Content-Type': 'application/ld+json'
				},
				method: "PUT",
				body: JSON.stringify(transactions.add)
			}).then(response => response.status)
		}

		resultCommit = await fetch(transactionID + "?action=COMMIT", {
			headers: {
				'Content-Type': 'application/json'
			},
			method: "PUT"
		}).then(response => response.status)

		return ((resultAdd ? resultAdd === 200 : true) && (resultDelete ? resultDelete === 200 : true) && resultCommit === 200);
	} else return false;
}

export async function updateProjectSettings(contextIRI: string, contextEndpoint: string) {
	let ogContext = "http://onto.fel.cvut.cz/ontologies/application/ontoGrapher"

	let contextLD = {
		"@context": {...Prefixes},
		"@id": contextIRI,
		"@graph": [{
			"@id": contextIRI,
			"d-sgov-pracovní-prostor-pojem:odkazuje-na-kontext": ogContext
		}, {
			"@id": ogContext,
			"@type": "d-sgov-pracovní-prostor-pojem:aplikační-kontext"
		}]
	}

	let ogContextLD = {
		"@context": {...Prefixes},
		"@id": ogContext,
		"@graph": [{
			"@id": ogContext,
			"@type": "d-sgov-pracovní-prostor-pojem:aplikační-kontext",
			"d-sgov-pracovní-prostor-pojem:aplikační-kontext": contextIRI,
			"og:selectedDiagram": ProjectSettings.selectedDiagram,
			"og:selectedLink": ProjectSettings.selectedLink,
			"og:selectedLanguage": ProjectSettings.selectedLanguage,
			"og:diagram": Diagrams.map((diag, i) => ogContext + "/diagram-" + (i + 1))
		},
			...Object.keys(ProjectLinks).map((id, i) => {
				let linkIRI = ProjectLinks[id].iri + "-" + i;
				return {
					"@id": linkIRI,
					"@type": "og:link",
					"og:id": id,
					"og:source": ProjectElements[ProjectLinks[id].source].iri,
					"og:target": ProjectElements[ProjectLinks[id].target].iri,
					"og:diagram": ProjectLinks[id].diagram,
					"og:vertex": ProjectLinks[id].vertices.map((vertex, i) => (linkIRI + "/vertex-" + i))
				}
			})
		]
	}

	return await processTransaction(contextEndpoint, {"add": contextLD, "delete": contextLD}) &&
		await processTransaction(contextEndpoint, {"add": ogContextLD, "delete": ogContextLD});
}