import {
    Diagrams,
    Links,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Schemes,
    VocabularyElements
} from "../config/Variables";
import {initLanguageObject} from "../function/FunctionEditVars";
import * as joint from "jointjs";
import {Cardinality} from "../datatypes/Cardinality";
import * as _ from "lodash";
import * as Locale from "../locale/LocaleMain.json";
import {createRestriction} from "../function/FunctionRestriction";
import {LinkType} from "../config/Enum";

export async function fetchConcepts(
    endpoint: string,
    source: string,
    sendTo: { [key: string]: any },
    readOnly: boolean,
    graph?: string,
    getSubProperties?: boolean,
    subPropertyOf?: string,
    requiredType?: boolean,
    requiredTypes?: string[],
    requiredValues?: string[]) {
    if (!(source in Schemes)) await getScheme(source, endpoint, readOnly);

    let result: {
        [key: string]: {
            labels: { [key: string]: string },
            definitions: { [key: string]: string },
            types: string[],
            inScheme: string,
            domain?: string,
            range?: string,
            subClassOf: string[],
            restrictions: [],
            connections: []
            type: number,
            topConcept?: string;
            character?: string;
        }
    } = {};

    let query = [
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "PREFIX a-popis-dat-pojem: <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/>",
        "PREFIX z-sgov-pojem: <https://slovník.gov.cz/základní/pojem/>",
        "SELECT DISTINCT ?term ?termLabel ?termType ?termDefinition ?termDomain ?termRange ?topConcept ?character ?restriction ?restrictionPred ?onProperty ?target ?subClassOf",
        "WHERE {",
        graph && "GRAPH <" + graph + "> {",
        !subPropertyOf && "?term skos:inScheme <" + source + ">.",
        requiredType ? "?term a ?termType." : "OPTIONAL {?term a ?termType.}",
        subPropertyOf && "?term rdfs:subPropertyOf <" + subPropertyOf + ">.",
        requiredTypes && "VALUES ?termType {<" + requiredTypes.join("> <") + ">}",
        requiredValues && "VALUES ?term {<" + requiredValues.join("> <") + ">}",
        "OPTIONAL {?term skos:prefLabel ?termLabel.}",
        "OPTIONAL {?term skos:definition ?termDefinition.}",
        "OPTIONAL {?term z-sgov-pojem:charakterizuje ?character.}",
        "OPTIONAL {?term rdfs:domain ?termDomain.}",
        "OPTIONAL {?term rdfs:range ?termRange.}",
        "OPTIONAL {?term rdfs:subClassOf ?subClassOf. }",
        "OPTIONAL {?topConcept skos:hasTopConcept ?term. }",
        "OPTIONAL {?term rdfs:subClassOf ?restriction. ",
        "?restriction a owl:Restriction .",
        "?restriction owl:onProperty ?onProperty.",
        "?restriction ?restrictionPred ?target.",
        "filter (?restrictionPred not in (owl:onProperty, rdf:type))}",
        "}",
        graph && "}",
    ].join(" ");
    let q = endpoint + "?query=" + encodeURIComponent(query);
    await fetch(q, {headers: {"Accept": "application/json"}}).then(
        response => response.json()
    ).then(data => {
        for (let row of data.results.bindings) {
            if (!(row.term.value in result)) {
                if (getSubProperties) fetchConcepts(endpoint, source, sendTo, readOnly, graph, getSubProperties, row.term.value, requiredType, requiredTypes, requiredValues);
                result[row.term.value] = {
                    labels: initLanguageObject(""),
                    definitions: initLanguageObject(""),
                    types: [],
                    inScheme: source,
                    subClassOf: [],
                    restrictions: [],
                    connections: [],
                    type: LinkType.DEFAULT
                }
            }
            if (row.termType && !(result[row.term.value].types.includes(row.termType.value))) result[row.term.value].types.push(row.termType.value);
            if (row.termLabel) result[row.term.value].labels[row.termLabel['xml:lang']] = row.termLabel.value;
            if (row.termDefinition) result[row.term.value].definitions[row.termDefinition['xml:lang']] = row.termDefinition.value;
            if (row.termDomain) result[row.term.value].domain = row.termDomain.value;
            if (row.termRange) result[row.term.value].range = row.termRange.value;
            if (row.character) result[row.term.value].character = row.character.value;
            if (row.topConcept) result[row.term.value].topConcept = row.topConcept.value;
            if (row.subClassOf && row.subClassOf.type !== "bnode" && !(result[row.term.value].subClassOf.includes(row.subClassOf.value))) result[row.term.value].subClassOf.push(row.subClassOf.value);
            if (row.restriction && Object.keys(Links).includes(row.onProperty.value)) createRestriction(result, row.term.value, row.restrictionPred.value, row.onProperty.value, row.target);
        }
        Object.assign(sendTo, result);
        return true;
    }).catch(() => {
        return false;
    });
}

export async function getAllTypes(iri: string, endpoint: string, targetTypes: string[], targetSubClass: string[], init: boolean = false): Promise<boolean> {
    let subClassOf: string[] = init ? [iri] : _.cloneDeep(targetSubClass);
    while (subClassOf.length > 0) {
        let subc = subClassOf.pop();
        if (subc) {
            if (!(targetSubClass.includes(subc))) targetSubClass.push(subc);
            let query = [
                "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
                "SELECT ?type ?subClass",
                "WHERE {",
                "<" + subc + "> a ?type.",
                "<" + subc + "> rdfs:subClassOf ?subClass.",
                "}",
            ].join(" ");
            let q = endpoint + "?query=" + encodeURIComponent(query);
            await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
                return response.json();
            }).then(data => {
                for (let result of data.results.bindings) {
                    if (!(targetTypes.includes(result.type.value))) targetTypes.push(result.type.value);
                    if (!(subClassOf.includes(result.subClass.value)) &&
                        result.subClass.type !== "bnode") subClassOf.push(result.subClass.value);
                }
            }).catch(() => {
                return false;
            });
        } else break;
    }
    return true;
}

export async function getScheme(iri: string, endpoint: string, readOnly: boolean, graph?: string) {
    let query = [
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "PREFIX dct: <http://purl.org/dc/terms/>",
        "SELECT DISTINCT ?termLabel ?termTitle ?graph",
        "WHERE {",
        "GRAPH " + (graph ? ("<" + graph + ">") : ("?graph")) + " {",
        "OPTIONAL { <" + iri + "> dct:title ?termTitle . }",
        "OPTIONAL { <" + iri + "> rdfs:label ?termLabel . }",
        "}",
        "}"
    ].join(" ");
    let q = endpoint + "?query=" + encodeURIComponent(query);
    await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
        return response.json();
    }).then(data => {
        for (let result of data.results.bindings) {
            if (!(iri in Schemes)) Schemes[iri] = {
                labels: {},
                readOnly: readOnly,
                graph: "",
                color: "#FFF",
            }
            if (result.termLabel) Schemes[iri].labels[result.termLabel['xml:lang']] = result.termLabel.value;
            if (result.termTitle) Schemes[iri].labels[result.termTitle['xml:lang']] = result.termTitle.value;
            if (result.graph) Schemes[iri].graph = result.graph.value;
            else if (graph) Schemes[iri].graph = graph;
        }
    }).catch(() => {
        return false;
    });
}

export async function getElementsConfig(contextIRI: string, contextEndpoint: string, callback?: Function): Promise<boolean> {
    let elements: {
        [key: string]: {
            id: "",
            diagramIRI: string[],
            active: boolean,
            diagramPosition: { [key: number]: { x: number, y: number } },
            hidden: { [key: number]: boolean },
            diagrams: number[]
        }
    } = {}
    let query = [
        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
        "select ?id ?iri ?active ?diagram where {",
        "?elem a og:element .",
        "?elem og:context <" + contextIRI + ">.",
        "?elem og:iri ?iri .",
        "?elem og:id ?id .",
        "?elem og:active ?active .",
        "?elem og:diagram ?diagram .",
        "}"
    ].join(" ");
    let q = contextEndpoint + "?query=" + encodeURIComponent(query);
    await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
        return response.json();
    }).then(data => {
        for (let result of data.results.bindings) {
            let iri = result.iri.value;
            if (!(iri in elements)) {
                elements[iri] = {
                    id: "",
                    diagramIRI: [],
                    diagrams: [],
                    active: true,
                    diagramPosition: {},
                    hidden: {},
                }
            }
            elements[iri].id = result.id.value;
            elements[iri].active = result.active.value === "true";
            if (!(elements[iri].diagramIRI.includes(result.diagram.value)))
                elements[iri].diagramIRI.push(result.diagram.value);
        }
    }).catch(() => {
        if (callback) callback(false);
    });
    for (let iri in elements) {
        if (elements[iri].diagramIRI.length > 0) {
            for (let diag of elements[iri].diagramIRI) {
                let graph = "";
                if (!(iri in VocabularyElements &&
                    VocabularyElements[iri].inScheme &&
                    VocabularyElements[iri].inScheme in Schemes &&
                    Schemes[VocabularyElements[iri].inScheme].graph))
                    continue;
                graph = Schemes[VocabularyElements[iri].inScheme].graph;
                let query = [
                    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
                    "select ?positionX ?positionY ?hidden ?index where {",
                    graph !== "" ? "graph <" + graph + "> {" : "",
                    "BIND(<" + diag + "> as ?iri) .",
                    "?iri og:position-y ?positionY .",
                    "?iri og:position-x ?positionX .",
                    "?iri og:index ?index .",
                    "?iri og:hidden ?hidden .",
                    graph !== "" ? "}" : "",
                    "}"
                ].join(" ");
                let q = contextEndpoint + "?query=" + encodeURIComponent(query);
                await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
                    return response.json();
                }).then(data => {
                    for (let result of data.results.bindings) {
                        if (result.index) {
                            let index = parseInt(result.index.value);
                            elements[iri].diagrams.push(index);
                            elements[iri].diagramPosition[index] = {
                                x: parseInt(result.positionX.value),
                                y: parseInt(result.positionY.value)
                            };
                            elements[iri].hidden[index] = result.hidden.value === "true";
                        }
                    }
                }).catch(() => {
                    if (callback) callback(false);
                });
            }
        }
    }
    for (let id in ProjectElements) {
        if (ProjectElements[id].iri in elements) {
            ProjectElements[id].hidden = elements[ProjectElements[id].iri].hidden;
            ProjectElements[id].diagrams = elements[ProjectElements[id].iri].diagrams;
            ProjectElements[id].active = elements[ProjectElements[id].iri].active;
            ProjectElements[id].position = elements[ProjectElements[id].iri].diagramPosition;
        }
    }
    if (callback) callback(true);
    return true;
}

export async function getSettings(contextIRI: string, contextEndpoint: string, callback?: Function): Promise<boolean> {
    let contextInstance = ProjectSettings.contextIRI.substring(ProjectSettings.contextIRI.lastIndexOf("/"));
    let query = [
        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
        "select ?diagram ?index ?name ?color where {",
        "BIND(<" + ProjectSettings.ontographerContext + "> as ?ogContext).",
        "graph ?ogContext {",
        "?diagram og:context <" + contextIRI + "> .",
        "?diagram og:index ?index .",
        "?diagram og:name ?name .",
        "optional {<" + ProjectSettings.ontographerContext + contextInstance + "> og:viewColor ?color}",
        "}",
        "}"
    ].join(" ");
    let q = contextEndpoint + "?query=" + encodeURIComponent(query);
    await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
        return response.json();
    }).then(data => {
        for (let result of data.results.bindings) {
            if (!(parseInt(result.index.value) in Diagrams)) {
                Diagrams[parseInt(result.index.value)] = {name: Locale.untitled, json: {}, active: true}
            }
            Diagrams[parseInt(result.index.value)].name = result.name.value;
            if (result.color) ProjectSettings.viewColorPool = result.color.value;
        }
        if (data.results.bindings.length > 0) ProjectSettings.initialized = true;
    }).catch(() => {
        if (callback) callback(false);
        return false;
    });
    return true;
}

export async function getLinksConfig(contextIRI: string, contextEndpoint: string): Promise<boolean> {
    let query = [
        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
        "select ?id ?iri ?sourceID ?targetID ?source ?active ?target ?sourceCard1 ?sourceCard2 ?targetCard1 ?targetCard2 ?diagram ?vertex ?type where {",
        "?link a og:link .",
        "?link og:id ?id .",
        "?link og:iri ?iri .",
        "?link og:context <" + contextIRI + ">.",
        "?link og:source-id ?sourceID .",
        "?link og:target-id ?targetID .",
        "?link og:source ?source .",
        "?link og:active ?active .",
        "?link og:target ?target .",
        "?link og:type ?type .",
        "?link og:sourceCardinality1 ?sourceCard1 .",
        "?link og:sourceCardinality2 ?sourceCard2 .",
        "?link og:targetCardinality1 ?targetCard1 .",
        "?link og:targetCardinality2 ?targetCard2 .",
        "OPTIONAL {?link og:vertex ?vertex}",
        "}"
    ].join(" ");
    let q = contextEndpoint + "?query=" + encodeURIComponent(query);
    let links: {
        [key: string]: {
            iri: string,
            source: string,
            target: string,
            targetID: string,
            sourceID: string,
            vertexIRI: string[],
            vertexes: { [key: number]: { [key: number]: { x: number, y: number }, } },
            sourceCardinality1: string,
            sourceCardinality2: string,
            targetCardinality1: string,
            targetCardinality2: string,
            active: boolean,
            type: number,
        }
    } = {};
    await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
        return response.json();
    }).then(data => {
        for (let result of data.results.bindings) {
            if (!(result.id.value in links)) {
                links[result.id.value] = {
                    iri: result.iri.value,
                    source: result.source.value,
                    target: result.target.value,
                    targetID: result.targetID.value,
                    sourceID: result.sourceID.value,
                    active: result.active.value === "true",
                    vertexIRI: [],
                    vertexes: {},
                    type: result.type.value === "default" ? LinkType.DEFAULT : LinkType.GENERALIZATION,
                    sourceCardinality1: result.sourceCard1.value,
                    sourceCardinality2: result.sourceCard2.value,
                    targetCardinality1: result.targetCard1.value,
                    targetCardinality2: result.targetCard2.value,
                }
            }
            if (result.vertex && !(links[result.id.value].vertexIRI.includes(result.vertex.value)))
                links[result.id.value].vertexIRI.push(result.vertex.value);
        }
    }).catch(() => false);

    for (let link in links) {
        if (links[link].vertexIRI.length > 0) {
            let skipDeprecated = links[link].vertexIRI.find((iri: string) => iri.includes("/diagram"));
            for (let vertexIRI of links[link].vertexIRI) {
                if (!vertexIRI.includes("/diagram") && skipDeprecated) continue;
                let query = [
                    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
                    "select ?posX ?posY ?index ?diagram where {",
                    "BIND(<" + vertexIRI + "> as ?iri) .",
                    "?iri og:index ?index .",
                    "optional {?iri og:diagram ?diagram .}",
                    "?iri og:position-x ?posX .",
                    "?iri og:position-y ?posY .",
                    "}"
                ].join(" ");
                let q = contextEndpoint + "?query=" + encodeURIComponent(query);
                await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
                    return response.json();
                }).then(data => {
                    for (let result of data.results.bindings) {
                        let diagram = result.diagram ? parseInt(result.diagram.value) : 0;
                        if (!(diagram in links[link].vertexes)) links[link].vertexes[diagram] = {};
                        links[link].vertexes[diagram][parseInt(result.index.value)] = {
                            x: parseInt(result.posX.value),
                            y: parseInt(result.posY.value)
                        };
                    }
                }).catch(() => false);
            }
        }
        let sourceID, targetID;
        for (let id in ProjectElements) {
            if (ProjectElements[id].iri === links[link].source) sourceID = id;
            if (ProjectElements[id].iri === links[link].target) targetID = id;
            if (targetID && sourceID) break;
        }

        let convert: {[key:number]:joint.dia.Link.Vertex[]} = {};

        for (let diagram in links[link].vertexes) {
            convert[diagram] = [];
            for (let vert in links[link].vertexes[diagram]) {
                if (links[link].vertexes[diagram].hasOwnProperty(vert))
                    convert[diagram].push({
                        x: links[link].vertexes[diagram][vert].x,
                        y: links[link].vertexes[diagram][vert].y
                    })
            }
        }

        if (targetID && sourceID) {
            let sourceCard = new Cardinality(Locale.none, Locale.none);
            let targetCard = new Cardinality(Locale.none, Locale.none);
            sourceCard.setFirstCardinality(links[link].sourceCardinality1);
            sourceCard.setSecondCardinality(links[link].sourceCardinality2);
            targetCard.setFirstCardinality(links[link].targetCardinality1);
            targetCard.setSecondCardinality(links[link].targetCardinality2);
            ProjectLinks[link] = {
                iri: links[link].iri,
                source: sourceID,
                target: targetID,
                sourceCardinality: sourceCard,
                targetCardinality: targetCard,
                type: links[link].type,
                vertices: convert,
                active: links[link].active,
            }
            if (sourceID) {
                if (!(ProjectElements[sourceID].connections.includes(link))) {
                    ProjectElements[sourceID].connections.push(link);
                }
            }
        }
    }
    return true;
}