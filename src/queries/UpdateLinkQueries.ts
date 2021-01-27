import {ProjectElements, ProjectLinks, ProjectSettings} from "../config/Variables";
import {qb} from "./QueryBuilder";
import {LinkConfig} from "../config/LinkConfig";
import {DELETE, INSERT} from "@tpluscode/sparql-builder";

export function updateProjectLinkVertex(id: string, vertices: number[], diagram: number): string {

	checkLink(id);
	let linkIRI = ProjectSettings.ontographerContext + "-" + id;
	let vertIRIs = vertices.map(i => qb.i(`${linkIRI}/diagram-${diagram + 1}/vertex-${(i + 1)}`));
	let vertIRIsLegacy = vertices.map(i => qb.i(`${linkIRI}/vertex-${(i + 1)}`));

	if (vertIRIs.length === 0) return "";

	let insert = INSERT.DATA`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(qb.i(linkIRI), 'og:vertex', qb.a(vertIRIs)),
		...vertIRIs.map((iri, i) => [
			qb.s(iri, 'rdf:type', 'og:vertex'),
			qb.s(iri, 'og:index', qb.ll(vertices[i])),
			qb.s(iri, 'og:diagram', qb.ll(diagram)),
			qb.s(iri, 'og:position-x', qb.ll(Math.round(ProjectLinks[id].vertices[diagram][vertices[i]].x))),
			qb.s(iri, 'og:position-y', qb.ll(Math.round(ProjectLinks[id].vertices[diagram][vertices[i]].y))),
		].join(`
`))
	])}`.build();

	let delData = DELETE.DATA`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(qb.i(linkIRI), 'og:vertex', qb.a(vertIRIsLegacy))
	])}`.build();

	let delS = vertIRIs.map((iri) => DELETE`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(iri, '?p', '?o'),
	])}`.WHERE`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(iri, '?p', '?o'),
	])}`.build());

	let delSlegacy = vertIRIs.map((iri, i) => DELETE`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(vertIRIsLegacy[i], '?p', '?o'),
	])}`.WHERE`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(vertIRIsLegacy[i], '?p', '?o'),
	])}`.build());

	return qb.combineQueries(delData, ...delS, ...delSlegacy, insert);
}

export function updateDeleteProjectLinkVertex(id: string, from: number, to: number, diagram: number): string {
	let linkIRI = ProjectSettings.ontographerContext + "-" + id;
	let IRIs = [];
	if (from === to) return "";
	for (let i = from; i < to; i++) {
		IRIs.push(qb.i(`${linkIRI}/diagram-${diagram + 1}/vertex-${i + 1}`),
			qb.i(`${linkIRI}/vertex-${i + 1}`));
	}

	return DELETE.DATA`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(qb.i(linkIRI), 'og:vertex', qb.a(IRIs))
	])}`.build();
}

export function updateProjectLink(del: boolean, ...ids: string[]): string {
	let insertBody = [];
	let deletes = [];
	if (ids.length === 0) return "";
	for (let id of ids) {
		checkLink(id);
		let linkIRI = qb.i(ProjectSettings.ontographerContext + "-" + id);

		insertBody.push(
			qb.s(linkIRI, 'rdf:type', 'og:link'),
			qb.s(linkIRI, 'og:id', qb.ll(id)),
			qb.s(linkIRI, 'og:context', qb.i(ProjectSettings.contextIRI)),
			qb.s(linkIRI, 'og:iri', qb.i(ProjectLinks[id].iri)),
			qb.s(linkIRI, 'og:active', qb.ll(ProjectLinks[id].active)),
			qb.s(linkIRI, 'og:source-id', qb.ll(ProjectLinks[id].source)),
			qb.s(linkIRI, 'og:target-id', qb.ll(ProjectLinks[id].target)),
			qb.s(linkIRI, 'og:source', qb.i(ProjectElements[ProjectLinks[id].source].iri)),
			qb.s(linkIRI, 'og:target', qb.i(ProjectElements[ProjectLinks[id].target].iri)),
			qb.s(linkIRI, 'og:type', qb.ll(LinkConfig[ProjectLinks[id].type].id)),
			qb.s(linkIRI, 'og:sourceCardinality1', qb.ll(ProjectLinks[id].sourceCardinality.getFirstCardinality())),
			qb.s(linkIRI, 'og:sourceCardinality2', qb.ll(ProjectLinks[id].sourceCardinality.getSecondCardinality())),
			qb.s(linkIRI, 'og:targetCardinality1', qb.ll(ProjectLinks[id].targetCardinality.getFirstCardinality())),
			qb.s(linkIRI, 'og:targetCardinality2', qb.ll(ProjectLinks[id].targetCardinality.getSecondCardinality())),
		);

		if (del) deletes.push(
			DELETE`${qb.g(ProjectSettings.ontographerContext, [
				qb.s(linkIRI, '?p', '?o'),
			])}`.WHERE`${qb.g(ProjectSettings.ontographerContext, [
				qb.s(linkIRI, '?p', '?o'),
				'filter(?p not in (og:vertex))'
			])}`.build());
	}

	let insert = INSERT.DATA`${qb.g(ProjectSettings.ontographerContext, insertBody)}`.build();

	return qb.combineQueries(...deletes, insert);
}

export function updateProjectLinkVertices(diagram: number, ...ids: string[]): string {
	let insertBody = [];
	let deletes: string[] = [];
	if (ids.length === 0) return "";
	for (let id of ids) {
		checkLink(id);
		let linkIRI = ProjectSettings.ontographerContext + "-" + id;
		let vertices = ProjectLinks[id].vertices[diagram].map((vert, i) => qb.i(`${linkIRI}/diagram-${diagram + 1}/vertex-${i + 1}`));
		insertBody.push(
			qb.s(qb.i(linkIRI), 'og:vertex', qb.a(vertices)),
			...vertices.map((vertIRI, i) => [
				qb.s(vertIRI, 'rdf:type', 'og:vertexDiagram'),
				qb.s(vertIRI, 'og:index', qb.ll(i)),
				qb.s(vertIRI, 'og:diagram', qb.ll(diagram)),
				qb.s(vertIRI, 'og:position-x', qb.ll(Math.round(ProjectLinks[id].vertices[diagram][i].x))),
				qb.s(vertIRI, 'og:position-y', qb.ll(Math.round(ProjectLinks[id].vertices[diagram][i].y))),
			].join(`
			`))
		);
		vertices.forEach((vertIRI) => deletes.push(
			DELETE`${qb.g(ProjectSettings.ontographerContext, [
				qb.s(vertIRI, '?p', '?o')])}`
				.WHERE`${qb.g(ProjectSettings.ontographerContext, [
				qb.s(vertIRI, '?p', '?o'),
				'filter(?p not in (og:vertex))'
			])}`.build()));
	}
	let insert = INSERT.DATA`${qb.g(ProjectSettings.ontographerContext, insertBody)}`.build();

	return qb.combineQueries(...deletes, insert);
}

function checkLink(id: string) {
	if (!(id in ProjectLinks))
		throw new Error("Passed ID is not recognized as a relationship ID");
}