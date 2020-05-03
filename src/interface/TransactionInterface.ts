import {Prefixes, ProjectElements, ProjectLinks, VocabularyElements} from "../config/Variables";

export async function updateProjectElement(
	contextIRI: string,
	contextEndpoint: string,
	types: string[],
	labels: { [key: string]: string },
	definitions: { [key: string]: string },
	id: string) {

	let iri = ProjectElements[id].iri;
	let scheme = VocabularyElements[iri].inScheme;

	let jsonDefinitions: { "@value": string, "@language": string }[] = [];
	let jsonLabels: { "@value": string, "@language": string }[] = [];

	Object.keys(labels).forEach((lang) => {
		jsonLabels.push({"@value": labels[lang], "@language": lang});
	})
	Object.keys(definitions).forEach((lang) => {
		jsonDefinitions.push({"@value": definitions[lang], "@language": lang});
	})

	let jsonLD = {
		"@context": Prefixes,
		"@graph": [
			{
				"@id": iri,
				"@type": types,
				"skos:prefLabel": jsonLabels,
				"skos:definition": jsonDefinitions,
				"rdfs:isDefinedBy": scheme
			}
		]
	}

	let connections: { [key: string]: string } = {};
	ProjectElements[id].connections.forEach((linkID) => {
		connections[ProjectLinks[linkID].iri] = ProjectElements[ProjectLinks[linkID].target].iri
	});

	let url = contextEndpoint + "/statements";

	const response = await fetch(url, {
		body: JSON.stringify(jsonLD),
		headers: {
			'Content-Type': 'application/ld+json'
		},
		method: "POST"
	});
}

export function retryTransaction() {

}

export function updateProjectSettings(contextIRI: string, contextEndpoint: string) {

}