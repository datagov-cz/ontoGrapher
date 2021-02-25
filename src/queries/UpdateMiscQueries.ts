import {Diagrams, ProjectSettings} from "../config/Variables";
import {qb} from "./QueryBuilder";
import {DELETE, INSERT} from "@tpluscode/sparql-builder";

export function updateProjectSettings(contextIRI: string, diagram: number): string {

	const projIRI = ProjectSettings.ontographerContext + ProjectSettings.contextIRI.substring(ProjectSettings.contextIRI.lastIndexOf("/"));
	const diagramIRI = qb.i(projIRI + "/diagram-" + (diagram + 1));

	const insert = INSERT.DATA`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(qb.i(projIRI), 'og:context', qb.i(contextIRI)),
		qb.s(qb.i(projIRI), 'og:viewColor', qb.ll(ProjectSettings.viewColorPool)),
		qb.s(qb.i(projIRI), 'og:diagram', diagramIRI),
		qb.s(diagramIRI, 'og:index', qb.ll(diagram)),
		qb.s(diagramIRI, 'og:context', qb.i(contextIRI)),
		qb.s(diagramIRI, 'og:name', qb.ll(Diagrams[diagram].name)),
		qb.s(diagramIRI, 'og:active', qb.ll(Diagrams[diagram].active))
	])}`.build();

	let del = DELETE`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(qb.i(projIRI), '?p', '?o'),
		qb.s(diagramIRI, '?p1', '?o1'),
	])}`.WHERE`${qb.g(ProjectSettings.ontographerContext, [
		qb.s(qb.i(projIRI), '?p', '?o'),
		qb.s(diagramIRI, '?p1', '?o1'),
	])}`.build();

	return qb.combineQueries(del, insert);
}

export function updateDeleteTriples(iri: string, context: string, subject: boolean, object: boolean, blanks: boolean): string {
	let deletes = [];
	if (blanks) deletes.push(DELETE`${qb.g(context, [
		qb.s(qb.i(iri), 'rdfs:subClassOf', '?b'),
		qb.s('?b', '?p', '?o')
	])}`.WHERE`${qb.g(context, [
		qb.s(qb.i(iri), 'rdfs:subClassOf', '?b'),
		qb.s('?b', '?p', '?o'),
		"filter(isBlank(?b))."
	])}`.build());
	if (subject) deletes.push(DELETE`${qb.g(context, [
		qb.s(qb.i(iri), '?p', '?o')
	])}`.WHERE`${qb.g(context, [
		qb.s(qb.i(iri), '?p', '?o')
	])}`.build());
	if (object) deletes.push(DELETE`${qb.g(context, [
		qb.s('?s', '?p', qb.i(iri))
	])}`.WHERE`${qb.g(context, [
		qb.s('?s', '?p', qb.i(iri))
	])}`.build());
	return qb.combineQueries(...deletes);
}