import * as joint from 'jointjs';
import {ProjectElements, ProjectLinks, Schemes, VocabularyElements} from "./Variables";
import {initLanguageObject} from "../function/FunctionEditVars"
import {generalizationLink} from "../graph/uml/GeneralizationLink";
import {LinkType} from "./Enum";

export var LinkConfig: {
	[key: number]: {
		update: (id: string) => string[],
		newLink: (id?: string) => joint.dia.Link,
		labels: { [key: string]: string }
	}
} = {
	[LinkType.DEFAULT]: {
		labels: initLanguageObject(""),
		newLink: (id) => {
			if (id) return new joint.shapes.standard.Link({id: id});
			else return new joint.shapes.standard.Link();
		},
		update: (id: string) => {
			let iri = ProjectElements[ProjectLinks[id].source].iri;
			let contextIRI = Schemes[VocabularyElements[iri].inScheme].graph

			let conns = ProjectElements[ProjectLinks[id].source].connections.filter(linkID =>
				linkID in ProjectLinks &&
				ProjectElements[ProjectLinks[linkID].target] &&
				ProjectLinks[linkID].active &&
				ProjectLinks[linkID].type === LinkType.DEFAULT).map((linkID) => ("<" + iri + "> rdfs:subClassOf [rdf:type owl:Restriction; " +
				"owl:onProperty <" + ProjectLinks[linkID].iri + ">;" +
				"owl:someValuesFrom <" + ProjectElements[ProjectLinks[linkID].target].iri + ">]." +
				"<" + iri + "> rdfs:subClassOf [rdf:type owl:Restriction; " +
				"owl:onProperty <" + ProjectLinks[linkID].iri + ">;" +
				"owl:allValuesFrom <" + ProjectElements[ProjectLinks[linkID].target].iri + ">].")
			)

			let restrictions = VocabularyElements[iri].restrictions.filter(rest => !(rest.target in VocabularyElements)).map(rest =>
				("<" + iri + "> rdfs:subClassOf [rdf:type owl:Restriction; " +
					"owl:onProperty <" + rest.onProperty + ">;" +
					"<" + rest.restriction + "> <" + rest.target + ">].")
			)

			return [
				[
					"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
					"PREFIX owl: <http://www.w3.org/2002/07/owl#>",
					"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
					"with <" + contextIRI + ">",
					"delete {",
					"?b ?p ?o.",
					"<" + iri + "> rdfs:subClassOf ?b.",
					"} where {",
					"<" + iri + "> rdfs:subClassOf ?b.",
					"filter(isBlank(?b)).",
					"?b ?p ?o.",
					"}"
				].join(" "),
				[
					"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
					"PREFIX owl: <http://www.w3.org/2002/07/owl#>",
					"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
					"insert data {",
					"graph <" + contextIRI + ">{",
					...restrictions,
					...conns,
					"}}"
				].join(" ")
			];
		}
	},
	[LinkType.GENERALIZATION]: {
		labels: {"cs": "Generalizace", "en": "Generalization"},
		newLink: (id) => {
			if (id) return new generalizationLink({id: id});
			else return new generalizationLink();
		},
		update: (id) => {
			let iri = ProjectElements[ProjectLinks[id].source].iri;
			let contextIRI = Schemes[VocabularyElements[iri].inScheme].graph
			let subClassOf: string[] = ProjectElements[ProjectLinks[id].source].connections.filter(conn =>
				ProjectLinks[conn].type === LinkType.GENERALIZATION && ProjectLinks[conn].active).map(conn =>
				"<" + iri + "> rdfs:subClassOf <" + ProjectElements[ProjectLinks[conn].target].iri + ">.");
			let list = VocabularyElements[iri].subClassOf.filter(superClass => !(superClass in VocabularyElements)).map(superClass =>
				"<" + iri + "> rdfs:subClassOf <" + superClass + ">."
			)
			return [[
				"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
				"with <" + contextIRI + ">",
				"delete {",
				"<" + iri + "> rdfs:subClassOf ?c.",
				"} where {",
				"<" + iri + "> rdfs:subClassOf ?c.",
				"filter(!isBlank(?c)).",
				"}"
			].join(" "), [
				"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
				"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
				"PREFIX owl: <http://www.w3.org/2002/07/owl#>",
				"insert data {",
				"graph <" + contextIRI + ">{",
				...list,
				...subClassOf,
				"}}"
			].join(" ")];
		}
	}
};