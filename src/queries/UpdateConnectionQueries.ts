import {Links, ProjectElements, ProjectLinks, Schemes, VocabularyElements} from "../config/Variables";
import {LinkType} from "../config/Enum";
import {parsePrefix} from "../function/FunctionEditVars";
import {qb} from "./QueryBuilder";
import {LinkConfig} from "../config/logic/LinkConfig";
import {DELETE, INSERT} from "@tpluscode/sparql-builder";

export function updateDefaultLink(id: string): string {
	const iri = ProjectElements[ProjectLinks[id].source].iri;
	const contextIRI = Schemes[VocabularyElements[iri].inScheme].graph;

	const del: string = DELETE`${qb.g(contextIRI, [
		qb.s(qb.i(iri), 'rdfs:subClassOf', qb.v('b')),
		qb.s(qb.v('b'), '?p', '?o')
	])}
	`.WHERE`
		${qb.g(contextIRI, [
		qb.s(qb.i(iri), 'rdfs:subClassOf', qb.v('b')),
		qb.s(qb.v('b'), '?p', '?o'),
		"filter(isBlank(?b))."
	])}`.build();

	const insert: string = INSERT.DATA`${qb.g(contextIRI, [
		...ProjectElements[ProjectLinks[id].source].connections.filter(linkID =>
			linkID in ProjectLinks &&
			ProjectElements[ProjectLinks[linkID].target] &&
			ProjectLinks[linkID].active &&
			ProjectLinks[linkID].iri in Links &&
			ProjectLinks[linkID].type === LinkType.DEFAULT).map(linkID => [
			qb.s(qb.i(iri), 'rdfs:subClassOf', qb.b([
				qb.po('rdf:type', 'owl:Restriction'),
				qb.po('owl:onProperty', qb.i(ProjectLinks[linkID].iri)),
				qb.po('owl:someValuesFrom', qb.i(ProjectElements[ProjectLinks[linkID].target].iri)),
			])),
			qb.s(qb.i(iri), 'rdfs:subClassOf', qb.b([
				qb.po('rdf:type', 'owl:Restriction'),
				qb.po('owl:onProperty', qb.i(ProjectLinks[linkID].iri)),
				qb.po('owl:allValuesFrom', qb.i(ProjectElements[ProjectLinks[linkID].target].iri)),
			])),
			(((VocabularyElements[iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti")) ||
				VocabularyElements[iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))) &&
				ProjectLinks[id].targetCardinality.getString() !== "") ?
				[checkNumber(ProjectLinks[linkID].targetCardinality.getFirstCardinality()) ?
					qb.s(qb.i(iri), 'rdfs:subClassOf', qb.b([
						qb.po('rdf:type', 'owl:Restriction'),
						qb.po('owl:onProperty', qb.i(ProjectLinks[linkID].iri)),
						qb.po('owl:onClass', qb.i(ProjectElements[ProjectLinks[linkID].target].iri)),
						qb.po('owl:minQualifiedCardinality',
							qb.lt(ProjectLinks[linkID].targetCardinality.getFirstCardinality(), 'xsd:nonNegativeInteger'))
					])) : '',
					checkNumber(ProjectLinks[linkID].targetCardinality.getSecondCardinality()) ?
						qb.s(qb.i(iri), 'rdfs:subClassOf', qb.b([
							qb.po('rdf:type', 'owl:Restriction'),
							qb.po('owl:onProperty', qb.i(ProjectLinks[linkID].iri)),
							qb.po('owl:onClass', qb.i(ProjectElements[ProjectLinks[linkID].target].iri)),
							qb.po('owl:maxQualifiedCardinality',
								qb.lt(ProjectLinks[linkID].targetCardinality.getSecondCardinality(), 'xsd:nonNegativeInteger'))
						])) : ''].join(`
				`) : '')
		].join(`
		`)),
		...VocabularyElements[iri].restrictions.filter(rest => !(rest.target in VocabularyElements)).map(rest => [
				qb.s(qb.i(iri), 'rdfs:subClassOf', qb.b([
					qb.po('rdf:type', 'owl:Restriction'),
					qb.po('owl:onProperty', qb.i(rest.onProperty)),
					qb.po(qb.i(rest.restriction),
						parseInt(rest.target, 10) ? qb.lt(rest.target, 'xsd:nonNegativeInteger') : qb.i(rest.target)),
				]))
			].join(`
			`)
		)
	])}`.build();

	return qb.combineQueries(del, insert);
}

export function updateGeneralizationLink(id: string): string {
	const iri = ProjectElements[ProjectLinks[id].source].iri;
	const contextIRI = Schemes[VocabularyElements[iri].inScheme].graph

	const subClassOf: string[] = ProjectElements[ProjectLinks[id].source].connections.filter(conn =>
		ProjectLinks[conn].type === LinkType.GENERALIZATION && ProjectLinks[conn].active).map(conn =>
		qb.i(ProjectElements[ProjectLinks[conn].target].iri));
	const list = VocabularyElements[iri].subClassOf.filter(superClass => !(superClass in VocabularyElements)).map(superClass =>
		qb.i(superClass)
	)

	let del = DELETE`${qb.g(contextIRI, [
		qb.s(qb.i(iri), 'rdfs:subClassOf', '?b'),
	])}`.WHERE`${qb.g(contextIRI, [
		qb.s(qb.i(iri), 'rdfs:subClassOf', '?b'),
		"filter(!isBlank(?b))."
	])}`.build();

	let insert = INSERT.DATA`${qb.g(contextIRI, [
		qb.s(qb.i(iri), 'rdfs:subClassOf', qb.a(subClassOf.concat(list)))
	])}`.build();

	return qb.combineQueries(del, insert);
}

export function updateConnections(id: string): string {
	return LinkConfig[ProjectLinks[id].type].update(id);
}

function checkNumber(str: string) {
	return /^[0-9]$/.test(str);
}
