import * as joint from 'jointjs';
import {Links, Prefixes, ProjectElements, ProjectLinks, Schemes, VocabularyElements} from "./Variables";
import {initLanguageObject} from "../function/FunctionEditVars"
import {generalizationLink} from "../graph/uml/GeneralizationLink";

export var LinkConfig: {
	[key: string]: {
		add: (id: string) => {},
		delete: (id: string, del: string[]) => {}
		newLink: (id?: string) => joint.dia.Link,
		labels: { [key: string]: string }
	}
} = {
	"default": {
		labels: initLanguageObject(""),
		newLink: (id) => {
			if (id) return new joint.shapes.standard.Link({id: id});
			else return new joint.shapes.standard.Link();
		},
		add: (id: string) => {
			let iri = ProjectElements[ProjectLinks[id].source].iri;
			let scheme = VocabularyElements[iri].inScheme;
			let connections: {
				"@type": "owl:Restriction",
				"owl:onProperty": string,
				"owl:someValuesFrom"?: string
				"owl:allValuesFrom"?: string
			}[] = [];
			let connectionContext: { [key: string]: any } = {};
			let linkContext: { [key: string]: any } = {};

			Object.keys(Links).forEach(link => {
				if (Links[link].type === "default") linkContext[link] = {"@type": "@id"};
			})

			ProjectElements[ProjectLinks[id].source].connections.forEach((linkID) => {
				if (linkID in ProjectLinks &&
					ProjectElements[ProjectLinks[linkID].target] &&
					ProjectLinks[linkID].active &&
					ProjectLinks[linkID].type === "default"
				) {
					connections.push({
						"@type": "owl:Restriction",
						"owl:onProperty": ProjectLinks[linkID].iri,
						"owl:someValuesFrom": ProjectElements[ProjectLinks[linkID].target].iri
					});
					connections.push({
						"@type": "owl:Restriction",
						"owl:onProperty": ProjectLinks[linkID].iri,
						"owl:allValuesFrom": ProjectElements[ProjectLinks[linkID].target].iri
					});
					connectionContext[ProjectLinks[linkID].iri] = {"@type": "@id"};
					connectionContext[ProjectElements[ProjectLinks[linkID].target].iri] = {"@type": "@id"};
				}
			})

			return {
				"@context": {
					...Prefixes,
					...connectionContext,
					...linkContext,
					"owl:allValuesFrom": {"@type": "@id"},
					"owl:someValuesFrom": {"@type": "@id"},
					"owl:onProperty": {"@type": "@id"},
				},
				"@id": Schemes[scheme].graph,
				"@graph": [
					{
						"@id": iri,
						"rdfs:subClassOf": connections
					}
				]
			};
		},
		delete: (id, del) => {
			let iri = ProjectElements[ProjectLinks[id].source].iri;
			let scheme = VocabularyElements[iri].inScheme;
			let connectionContext: { [key: string]: any } = {};
			let linkContext: { [key: string]: any } = {};
			let delConnections: {
				"@type": "owl:Restriction",
				"owl:onProperty": string,
				"owl:someValuesFrom"?: string
				"owl:allValuesFrom"?: string
			}[] = [];

			Object.keys(Links).forEach(link => {
				if (Links[link].type === "default") linkContext[link] = {"@type": "@id"};
			})

			del.forEach((linkID) => {
				if (linkID in ProjectLinks && ProjectElements[ProjectLinks[linkID].target]) {
					delConnections.push({
						"@type": "owl:Restriction",
						"owl:onProperty": ProjectLinks[linkID].iri,
						"owl:someValuesFrom": ProjectElements[ProjectLinks[linkID].target].iri
					});
					delConnections.push({
						"@type": "owl:Restriction",
						"owl:onProperty": ProjectLinks[linkID].iri,
						"owl:allValuesFrom": ProjectElements[ProjectLinks[linkID].target].iri
					});
					connectionContext[ProjectLinks[linkID].iri] = {"@type": "@id"}
				}
			})

			return {
				"@context": {
					...Prefixes,
					...connectionContext,
					...linkContext,
					"owl:allValuesFrom": {"@type": "@id"},
					"owl:someValuesFrom": {"@type": "@id"},
					"owl:onProperty": {"@type": "@id"},
				},
				"@id": Schemes[scheme].graph,
				"@graph": [
					{
						"@id": iri,
						"rdfs:subClassOf": delConnections
					}
				]
			};
		}
	},
	"generalization": {
		labels: {"cs": "Generalizace", "en": "Generalization"},
		newLink: (id) => {
			if (id) return new generalizationLink({id: id});
			else return new generalizationLink();
		},
		add: (id) => {
			let subClassOf: string[] = ProjectElements[ProjectLinks[id].source].connections.filter(conn => ProjectLinks[conn].type === "generalization").map(conn => ProjectElements[ProjectLinks[conn].target].iri);
			let sourceIRI = ProjectElements[ProjectLinks[id].source].iri;
			let scheme = VocabularyElements[sourceIRI].inScheme;
			return {
				"@context": {...Prefixes, "rdfs:subClassOf": {"@type": "@id"}},
				"@id": Schemes[scheme].graph,
				"@graph": [
					{
						"@id": sourceIRI,
						"rdfs:subClassOf": subClassOf
					}
				]
			};
		},
		delete: (id, del) => {
			let iri = ProjectElements[ProjectLinks[id].source].iri;
			let scheme = VocabularyElements[iri].inScheme;
			let delConnections: string[] = [];

			del.forEach((linkID) => {
				delConnections.push(ProjectElements[ProjectLinks[linkID].target].iri);
			})

			return {
				"@context": {...Prefixes, "rdfs:subClassOf": {"@type": "@id"}},
				"@id": Schemes[scheme].graph,
				"@graph": [
					{
						"@id": iri,
						"rdfs:subClassOf": delConnections,
					}
				]
			};
		}
	}
};