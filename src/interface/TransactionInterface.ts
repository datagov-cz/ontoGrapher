import {
	Prefixes,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Schemes,
	VocabularyElements
} from "../config/Variables";
import {savePackages} from "../function/FunctionProject";
import {createNewElemIRI} from "../function/FunctionCreateVars";
import {AttributeObject} from "../datatypes/AttributeObject";

export async function updateProjectElement(
	contextIRI: string,
	contextEndpoint: string,
	newTypes: string[],
	labels: { [key: string]: string },
	definitions: { [key: string]: string },
	attributes: AttributeObject[],
	properties: AttributeObject[],
	id: string): Promise<boolean> {

	let iri = ProjectElements[id].iri;
	let scheme = VocabularyElements[iri].inScheme;
	let delTypes = VocabularyElements[iri].types;

	let addDefinitions: { "@value": string, "@language": string }[] = [];
	let addLabels: { "@value": string, "@language": string }[] = [];

	Object.keys(labels).forEach((lang) => {
		if (labels[lang] !== "") addLabels.push({"@value": labels[lang], "@language": lang});
	})
	Object.keys(definitions).forEach((lang) => {
		if (definitions[lang] !== "") addDefinitions.push({"@value": definitions[lang], "@language": lang});
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
			// {
			// 	"@id": iri + "/diagram",
			// 	"@type": "og:element",
			// 	"og:id": id,
			// 	"og:untitled": ProjectElements[id].untitled,
			// 	"og:attribute": iri + "/attribute",
			// 	"og:property": iri + "/property",
			// 	"og:active": ProjectElements[id].active,
			// },
			// ...ProjectElements[id].diagrams.map(diag => {
			// 	return {
			// 		"@id": iri + "/diagram-" + diag,
			// 		"@type": "og:elementDiagram",
			// 		"og:position-x": ProjectElements[id].position[diag].x,
			// 		"og:position-y": ProjectElements[id].position[diag].y,
			// 		"og:hidden": ProjectElements[id].hidden[diag]
			// 	}
			// }),
			// {
			// 	"@id": iri + "/attribute",
			// 	"@type": "rdf:Bag",
			// 	...attributes.map((attr, i) => {
			// 		return {
			// 			["rdf:_" + (i + 1)]: {
			// 				"og:attribute-name": attr.name,
			// 				"og:attribute-type": attr.type
			// 			}
			// 		}
			// 	}),
			// },
			// {
			// 	"@id": iri + "/property",
			// 	"@type": "rdf:Bag",
			// 	...properties.map((attr, i) => {
			// 		return {
			// 			["rdf:_" + (i + 1)]: {
			// 				"og:attribute-name": attr.name,
			// 				"og:attribute-type": attr.type
			// 			}
			// 		}
			// 	}),
			// },
		]
	}

	let deleteLD = {
		"@context": Prefixes,
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
				"skos:inScheme": scheme
			}
		]
	}
	console.log(newTypes, VocabularyElements[iri]);
	return await processTransaction(contextEndpoint, {"add": addLD, "delete": deleteLD});
}

export async function updateConnections(contextEndpoint: string, id: string, del: string[]) {
	let iri = ProjectElements[id].iri;
	let scheme = VocabularyElements[iri].inScheme;
	let connections: { [key: string]: string } = {};
	let connectionContext: { [key: string]: any } = {};
	ProjectElements[id].connections.forEach((linkID) => {
		connections[ProjectLinks[linkID].iri] = ProjectElements[ProjectLinks[linkID].target].iri
		connectionContext[ProjectLinks[linkID].iri] = {"@type": "@id"}
	})

	let deleteLD = {
		"@context": {...Prefixes, ...connectionContext},
		"@id": Schemes[scheme].graph,
		"@graph": [
			{
				"@id": iri,
				...del.map(conn => {
					return {[ProjectLinks[conn].iri]: ProjectElements[ProjectLinks[conn].target].iri}
				})
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

	return await processTransaction(contextEndpoint, {"add": addLD, "delete": deleteLD});
}

export async function processTransaction(contextEndpoint: string, transactions: { [key: string]: any }): Promise<boolean> {
	ProjectSettings.lastUpdate = transactions;

	let transactionUrl = contextEndpoint + "/transactions";
	let result = false;

	const transactionID = await fetch(transactionUrl, {
		headers: {
			'Content-Type': 'application/json'
		},
		method: "POST"
	}).then(response => response.headers).then(
		headers => headers.get("location")
	).catch(() => {
		return false;
	});


	if (transactionID) {
		await fetch(transactionID + "?action=DELETE", {
			headers: {
				'Content-Type': 'application/ld+json'
			},
			method: "PUT",
			body: JSON.stringify(transactions.delete)
		}).then(response => response.status).then(
			async status => {
				if (status === 200) {
					await fetch(transactionID + "?action=ADD", {
						headers: {
							'Content-Type': 'application/ld+json'
						},
						method: "PUT",
						body: JSON.stringify(transactions.add)
					}).then(response => response.status).then(
						async status => {
							if (status === 200) {
								await fetch(transactionID + "?action=COMMIT", {
									headers: {
										'Content-Type': 'application/json'
									},
									method: "PUT"
								}).then(response => response.status).then(status => {
									if (status === 200) result = true
								});
							}
						});
				}
			}
		)
	} else return false;
	return result;
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

	await processTransaction(contextEndpoint, {"add": contextLD, "delete": contextLD});

	let packages: { [key: string]: any } = {};
	//let packageIRI: string[] = [];
	savePackages().forEach(pkg => {
		let iri = createNewElemIRI(pkg.labels, packages, ogContext + "/package/");
		//packageIRI.push(iri);
		packages[iri] = {
			"@id": iri,
			"skos:prefLabel": Object.keys(pkg.labels).map((lang: string) => {
				return {"@value": pkg.labels[lang], "@language": lang}
			}),
			"ogpkg:root": pkg.root,
			"ogpkg:trace": iri + "/trace"
		};
		let trace = pkg.trace.map((num: number, i) => {
			return {["rdf:_" + (i + 1)]: num}
		})
		packages[iri + "/trace"] = {
			"@id": iri + "/trace",
			"@type": "rdf:Seq",
			...trace
		};
		if (pkg.scheme) (packages[iri]["ogpkg:scheme"] = pkg.scheme);
	});

	let ogContextLD = {
		"@context": {...Prefixes},
		"@id": ogContext,
		"@graph": [{
			"@id": ogContext,
			"d-sgov-pracovní-prostor-pojem:aplikační-kontext": contextIRI,
			"og:selectedDiagram": ProjectSettings.selectedDiagram,
			"og:selectedLink": ProjectSettings.selectedLink,
			"og:selectedLanguage": ProjectSettings.selectedLanguage,

		}, ...Object.values(packages)]
	}

	await processTransaction(contextEndpoint, {"add": ogContextLD, "delete": ogContextLD});
}