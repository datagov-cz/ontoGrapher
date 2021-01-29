import {PackageRoot, ProjectSettings, Schemes, VocabularyElements} from "../config/Variables";
import {fetchConcepts, getScheme} from "./SPARQLInterface";
import {PackageNode} from "../datatypes/PackageNode";
import {processQuery} from "./TransactionInterface";

export async function getContext(
	contextIRI: string,
	contextEndpoint: string): Promise<boolean> {
	let vocabularyQ = [
		"PREFIX owl: <http://www.w3.org/2002/07/owl#> ",
		"PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ",
		"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ",
		"PREFIX termit: <http://onto.fel.cvut.cz/ontologies/application/termit/>",
		"PREFIX a-popis-dat: <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/>",
		"PREFIX dcterms: <http://purl.org/dc/terms/>",
		"select ?vocab (bound(?ro) as ?readOnly) ?label ?title ?vocabLabel",
		"?vocabIRI",
		"where {",
		"BIND(<" + contextIRI + "> as ?contextIRI) . ",
		"OPTIONAL {?contextIRI rdfs:label ?label. }",
		"OPTIONAL {?contextIRI dcterms:title ?title. }",
		"graph ?contextIRI {",
		"?vocab a ?vocabType .",
		"VALUES ?vocabType {",
		"<https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext> ",
		"<https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext-pouze-pro-čtení> ",
		"} }",
		"graph ?vocab {",
		"?vocabIRI a <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/glosář> .",
		"?vocabIRI dcterms:title ?vocabLabel .",
		"}",
		"OPTIONAL{ ?vocab a  ?ro . FILTER(?ro = <https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext-pouze-pro-čtení>) .  } ",
		"}",
	].join(" ");
	let responseInit: { [key: string]: any }[] = await processQuery(contextEndpoint, vocabularyQ)
		.then((response) => response.json())
		.then((data) => {
			return data.results.bindings;
		}).catch(() => false);
	if (responseInit.length === 0) return false;
	let vocabularies: { [key: string]: { names: { [key: string]: string }, readOnly: boolean, terms: any, graph: string } } = {};
	if (responseInit) for (const result of responseInit) {
		if (!(result.vocabIRI.value in vocabularies)) {
			vocabularies[result.vocabIRI.value] = {
				readOnly: result.readOnly.value === "true",
				names: {},
				terms: {},
				graph: result.vocab.value
			};
		}
		vocabularies[result.vocabIRI.value].names[result.vocabLabel["xml:lang"]] = result.vocabLabel.value;
		if (result.label) ProjectSettings.name[result.label["xml:lang"]] = result.label.value;
		if (result.title) ProjectSettings.name[result.title["xml:lang"]] = result.title.value;
	}
	for (let vocab in vocabularies) {
		await getScheme(vocab, contextEndpoint, vocabularies[vocab].readOnly, vocabularies[vocab].graph).catch(() => false);
		await fetchConcepts(contextEndpoint, vocab, vocabularies[vocab].terms, vocabularies[vocab].readOnly, Schemes[vocab].graph).catch(() => false);
		Schemes[vocab].readOnly = vocabularies[vocab].readOnly;
		Object.assign(VocabularyElements, vocabularies[vocab].terms);
		new PackageNode(Schemes[vocab].labels, PackageRoot, false, vocab);
	}
	return true;
}