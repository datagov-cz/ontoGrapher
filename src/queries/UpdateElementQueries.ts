import {ProjectElements, ProjectSettings, Schemes, VocabularyElements} from "../config/Variables";
import {qb} from "./QueryBuilder";
import {DELETE, INSERT} from "@tpluscode/sparql-builder";

export function updateProjectElement(del: boolean, ...ids: string[]): string {
	let data: { [key: string]: string[] } = {};
	let deletes: string[] = [];
	let inserts: string[] = [];

	if (ids.length === 0) return "";
	for (let id of ids) {
		checkElem(id);
		const iri = ProjectElements[id].iri;
		const iriDiagram = `${ProjectElements[id].iri}/diagram`;
		const vocabElem = VocabularyElements[ProjectElements[id].iri];
		const scheme = vocabElem.inScheme;
		const graph = Schemes[vocabElem.inScheme].graph;
		const types = vocabElem.types.map(type => qb.i(type));
		const labels = Object.keys(vocabElem.labels).filter(lang => vocabElem.labels[lang]).map(lang => qb.ll(vocabElem.labels[lang], lang));
		const altLabels = vocabElem.altLabels.map(alt => qb.ll(alt.label, alt.language));
		const definitions = Object.keys(vocabElem.definitions).filter(lang => vocabElem.definitions[lang]).map(lang => qb.ll(vocabElem.definitions[lang], lang));
		const names = Object.keys(ProjectElements[id].selectedLabel).map(lang => qb.ll(ProjectElements[id].selectedLabel[lang], lang));
		const diagrams = ProjectElements[id].diagrams.map((diag) => qb.i(`${ProjectElements[id].iri}/diagram-${diag + 1}`));

		if (!(graph in data)) data[graph] = [];
		if (del) data[graph].push(
			qb.s(qb.i(iri), 'rdf:type', qb.a(types)),
			qb.s(qb.i(iri), 'skos:prefLabel', qb.a(labels)),
			qb.s(qb.i(iri), 'skos:altLabel', qb.a(altLabels), altLabels.length > 0),
			qb.s(qb.i(iri), 'skos:definition', qb.a(definitions), definitions.length > 0),
			qb.s(qb.i(iri), 'skos:inScheme', qb.i(scheme)),
			qb.s(qb.i(scheme), 'skos:hasTopConcept', qb.i(iri), vocabElem.topConcept !== undefined)
		);
		data[graph].push(
			qb.s(qb.i(iriDiagram), 'rdf:type', 'og:element'),
			qb.s(qb.i(iriDiagram), 'og:context', qb.i(ProjectSettings.contextIRI)),
			qb.s(qb.i(iriDiagram), 'og:id', qb.ll(id)),
			qb.s(qb.i(iriDiagram), 'og:iri', qb.i(iri)),
			qb.s(qb.i(iriDiagram), 'og:name', qb.a(names)),
			qb.s(qb.i(iriDiagram), 'og:diagram', qb.a(diagrams)),
			qb.s(qb.i(iriDiagram), 'og:active', qb.ll(ProjectElements[id].active)),
		);

		if (del) deletes.push(...[
			qb.s(qb.i(iri), 'rdf:type', '?type'),
			qb.s(qb.i(iri), 'skos:prefLabel', '?label'),
			qb.s(qb.i(iri), 'skos:altLabel', '?alt'),
			qb.s(qb.i(iri), 'skos:definition', '?definition'),
			qb.s(qb.i(iriDiagram), 'og:name', '?name'),
			qb.s(qb.i(iriDiagram), 'og:diagram', '?diagram'),
			qb.s(qb.i(iriDiagram), 'og:iri', '?iri'),
			qb.s(qb.i(iriDiagram), 'og:active', '?active'),
		].map(stmt => DELETE`${qb.g(graph, [stmt])}`.WHERE`${qb.g(graph, [stmt])}`.build()));
	}

	for (let graph in data) {
		inserts.push(INSERT.DATA`${qb.g(graph, data[graph])}`.build());
	}

	return qb.combineQueries(...deletes, ...inserts);
}

export function updateProjectElementDiagram(diagram: number, ...ids: string[]): string {
	let inserts: string[] = [];
	let deletes: string[] = [];

	if (ids.length === 0) return "";
	for (let id of ids) {
		checkElem(id);
		let iri = ProjectElements[id].iri;
		let diagIRI = iri + "/diagram-" + (diagram + 1);
		let scheme = VocabularyElements[iri].inScheme;

		inserts.push(INSERT.DATA`${qb.g(Schemes[scheme].graph, [
			qb.s(qb.i(iri + "/diagram"), 'og:diagram', qb.i(diagIRI)),
			qb.s(qb.i(diagIRI), 'rdf:type', 'og:elementDiagram'),
			qb.s(qb.i(diagIRI), 'og:index', qb.ll(diagram)),
			qb.s(qb.i(diagIRI), 'og:position-x', qb.ll(Math.round(ProjectElements[id].position[diagram].x))),
			qb.s(qb.i(diagIRI), 'og:position-y', qb.ll(Math.round(ProjectElements[id].position[diagram].y))),
			qb.s(qb.i(diagIRI), 'og:hidden', qb.ll(ProjectElements[id].hidden[diagram])),
		])}`.build());

		deletes.push(DELETE`${qb.g(Schemes[scheme].graph, [
			qb.s(qb.i(diagIRI), '?p', '?o'),
		])}`.WHERE`${qb.g(Schemes[scheme].graph, [
			qb.s(qb.i(diagIRI), '?p', '?o'),
		])}`.build());
	}

	return qb.combineQueries(...deletes, ...inserts);
}

function checkElem(id: string) {
	if (!(id in ProjectElements))
		throw new Error("Passed ID is not recognized as an element ID");
	if (!(ProjectElements[id].iri in VocabularyElements))
		throw new Error("Element ID is not tied to a Concept IRI");
}