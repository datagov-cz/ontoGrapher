import {
    Diagrams,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Schemes,
    VocabularyElements
} from "../config/Variables";
import {initLanguageObject} from "../function/FunctionEditVars";
import {AttributeObject} from "../datatypes/AttributeObject";
import * as joint from "jointjs";
import {Cardinality} from "../datatypes/Cardinality";

import * as Locale from "../locale/LocaleMain.json";

export async function fetchConcepts(
    endpoint: string,
    source: string,
    sendTo: { [key: string]: any },
    readOnly: boolean,
    callback?: Function,
    subclassOf?: string,
    requiredTypes?: string[],
    requiredValues?: string[]) {
    if (!(source in Schemes)) await getScheme(source, endpoint, readOnly, callback);

    let result: {
        [key: string]: {
            labels: { [key: string]: string },
            definitions: { [key: string]: string },
            types: string[],
            inScheme: string,
            domainOf: []
        }
    } = {};

    let query = [
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "SELECT DISTINCT ?term ?termLabel ?termType ?termDefinition",
        "WHERE {",
        !subclassOf ? "?term skos:inScheme <" + source + ">." : "",
        "?term a ?termType.",
        subclassOf ? "?term rdfs:subPropertyOf <" + subclassOf + ">." : "",
        requiredTypes ? "VALUES ?termType {<" + requiredTypes.join("> <") + ">}" : "",
        requiredValues ? "VALUES ?term {<" + requiredValues.join("> <") + ">}" : "",
        "OPTIONAL {?term skos:prefLabel ?termLabel.}",
        "OPTIONAL {?term skos:definition ?termDefinition.}",
        "FILTER (?term NOT IN (<https://slovník.gov.cz/základní/pojem/vztah>))",
        "}"
    ].join(" ");
    let q = endpoint + "?query=" + encodeURIComponent(query);
    await fetch(q, {headers: {"Accept": "application/json"}}).then(
        response => response.json()
    ).then(async data => {
        for (let row of data.results.bindings){
            if (!(row.term.value in result)) {
                await fetchConcepts(endpoint, source, sendTo, readOnly, callback, row.term.value, requiredTypes, requiredValues);
                result[row.term.value] = {
                    labels: initLanguageObject(""),
                    definitions: initLanguageObject(""),
                    types: [],
                    inScheme: source,
                    domainOf: []
                }
            }
            if (row.termType && !(result[row.term.value].types.includes(row.termType.value))) result[row.term.value].types.push(row.termType.value);
            if (row.termLabel) result[row.term.value].labels[row.termLabel['xml:lang']] = row.termLabel.value;
            if (row.termDefinition) result[row.term.value].definitions[row.termDefinition['xml:lang']] = row.termDefinition.value;
        }
        Object.assign(sendTo, result);
        if (callback) callback(true);
    }).catch(() => {
        if (callback) callback(false);
    });
}

export async function getScheme(iri: string, endpoint: string, readOnly: boolean, callback?: Function) {
    let query = [
        "SELECT DISTINCT ?term ?termLabel ?graph",
        "WHERE {",
        "GRAPH ?graph {",
        "<" + iri + "> rdfs:label ?termLabel .",
        "}",
        "}"
    ].join(" ");
    let q = endpoint + "?query=" + encodeURIComponent(query);
    await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
        return response.json();
    }).then(data => {
        for (let result of data.results.bindings) {
            if (!(iri in Schemes)) Schemes[iri] = {labels: {}, readOnly: readOnly, graph: ""}
            if (result.termLabel !== undefined) Schemes[iri].labels[result.termLabel['xml:lang']] = result.termLabel.value;
            if (result.graph !== undefined) Schemes[iri].graph = result.graph.value;
        }
    }).catch(() => {
        if (callback) callback(false);
    });
}

export async function getElementsConfig(endpoint: string, callback?: Function) {
    let editableSchemes = Object.keys(Schemes).filter((scheme) => !Schemes[scheme].readOnly);
    for (let iri in VocabularyElements) {
        if (editableSchemes.includes(VocabularyElements[iri].inScheme)) {
            let element: {
                id: "",
                untitled: false,
                attributeIRI: string[],
                propertyIRI: string[],
                diagramIRI: number[],
                active: boolean,
                diagramPosition: { [key: number]: { x: number, y: number } },
                hidden: { [key: number]: boolean },
                attributes: AttributeObject[],
                properties: AttributeObject[],
                diagrams: number[]
            } = {
                id: "",
                untitled: false,
                attributeIRI: [],
                propertyIRI: [],
                diagramIRI: [],
                diagrams: [],
                active: true,
                diagramPosition: {},
                hidden: {},
                attributes: [],
                properties: [],
            }
            let query = [
                "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
                "select ?id ?untitled ?active ?attribute ?property ?diagram where {",
                "BIND(<" + (iri + "/diagram") + "> as ?iri) .",
                "?iri og:id ?id .",
                "?iri og:active ?active .",
                "?iri og:untitled ?untitled .",
                "?iri og:attribute ?attribute .",
                "?iri og:property ?property .",
                "?iri og:diagram ?diagram .",
                "}"
            ].join(" ");
            let q = endpoint + "?query=" + encodeURIComponent(query);
            await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
                return response.json();
            }).then(data => {
                for (let result of data.results.bindings) {
                    if (result.id) element.id = result.id.value;
                    if (result.active) element.active = result.active.value;
                    if (result.untitled) element.untitled = result.untitled.value;
                    if (result.attribute) element.attributeIRI.push(result.attribute.value);
                    if (result.property) element.propertyIRI.push(result.property.value);
                    if (result.diagram) element.diagramIRI.push(result.diagram.value);
                }
            }).catch(() => {
                if (callback) callback(false);
            });
            if (element.diagramIRI.length > 0) {
                for (let diag in element.diagramIRI) {
                    let query = [
                        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
                        "select ?positionX ?positionY ?hidden ?index where {",
                        "BIND(<" + diag + "> as ?iri) .",
                        "?iri og:position-y ?positionY .",
                        "?iri og:position-x ?positionX .",
                        "?iri og:index ?index .",
                        "?iri og:hidden ?hidden .",
                        "}"
                    ].join(" ");
                    let q = endpoint + "?query=" + encodeURIComponent(query);
                    await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
                        return response.json();
                    }).then(data => {
                        for (let result of data.results.bindings) {
                            if (result.index) {
                                let index = result.index.value;
                                if (result.positionX) element.diagramPosition[index].x = result.positionX.value;
                                if (result.positionY) element.diagramPosition[index].y = result.positionY.value;
                                if (result.hidden) element.hidden[index] = result.hidden.value;
                            }
                        }
                    }).catch(() => {
                        if (callback) callback(false);
                    });
                }
            }
            if (element.attributeIRI.length > 0) {
                for (let attr in element.attributeIRI) {
                    let query = [
                        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
                        "select ?attrname ?attrtype where {",
                        "BIND(<" + attr + "> as ?iri) .",
                        "?iri og:attribute-name ?attrname .",
                        "?iri og:attribute-type ?attrtype .",
                        "}"
                    ].join(" ");
                    let q = endpoint + "?query=" + encodeURIComponent(query);
                    await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
                        return response.json();
                    }).then(data => {
                        for (let result of data.results.bindings) {
                            if (result.attrname && result.attrtype) {
                                element.attributes.push(new AttributeObject(result.attrname.value, result.attrtype.value));
                            }
                        }
                    }).catch(() => {
                        if (callback) callback(false);
                    });
                }
            }
            if (element.propertyIRI.length > 0) {
                for (let attr in element.propertyIRI) {
                    let query = [
                        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
                        "select ?attrname ?attrtype where {",
                        "BIND(<" + attr + "> as ?iri) .",
                        "?iri og:attribute-name ?attrname .",
                        "?iri og:attribute-type ?attrtype .",
                        "}"
                    ].join(" ");
                    let q = endpoint + "?query=" + encodeURIComponent(query);
                    await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
                        return response.json();
                    }).then(data => {
                        for (let result of data.results.bindings) {
                            if (result.attrname && result.attrtype) {
                                element.properties.push(new AttributeObject(result.attrname.value, result.attrtype.value));
                            }
                        }
                    }).catch(() => {
                        if (callback) callback(false);
                    });
                }
            }
            for (let id in ProjectElements) {
                if (ProjectElements[id].iri === iri) {
                    ProjectElements[id].untitled = element.untitled;
                    ProjectElements[id].properties = element.properties;
                    ProjectElements[id].attributes = element.attributes;
                    ProjectElements[id].hidden = element.hidden;
                    ProjectElements[id].diagrams = element.diagrams;
                    ProjectElements[id].active = element.active;
                    break;
                }
            }
        }
    }
    if (callback) callback(true);
}

export async function getSettings(endpoint: string, callback?: Function) {
    let query = [
        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
        "select ?diagram where {",
        "BIND(<" + ProjectSettings.ontographerContext + "> as ?ogContext.",
        "?ogContext og:diagram ?diagram",
        "?diagram og:index ?index",
        "?diagram og:name ?name",
        "}"
    ].join(" ");
    let q = endpoint + "?query=" + encodeURIComponent(query);
    await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
        return response.json();
    }).then(data => {
        for (let result of data.results.bindings) {
            if (!(result.index.value in Diagrams)) {
                Diagrams[result.index.value] = {name: Locale.untitled, json: {}}
            }
            Diagrams[result.index.value].name = result.name.value;
        }
    }).catch(() => {
        if (callback) callback(false);
    });
}

export async function getLinksConfig(endpoint: string, callback?: Function) {
    let query = [
        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
        "select ?id ?iri ?sourceID ?targetID ?source ?target ?sourceCard1 ?sourceCard2 ?targetCard1 ?targetCard2 ?diagram ?vertex {",
        "?link a og:link .",
        "?link og:id ?id .",
        "?link og:iri ?iri",
        "?link og:source-id ?sourceID .",
        "?link og:target-id ?targetID .",
        "?link og:source ?source .",
        "?link og:target ?target .",
        "?link og:diagram ?diagram .",
        "?link og:vertex ?vertex .",
        "OPTIONAL {?link og:sourceCardinality1 ?sourceCard1 .}",
        "OPTIONAL {?link og:sourceCardinality2 ?sourceCard2 .}",
        "OPTIONAL {?link og:targetCardinality1 ?targetCard1 .}",
        "OPTIONAL {?link og:sourceCardinality2 ?targetCard2 .}",
        "}"
    ].join(" ");

    let q = endpoint + "?query=" + encodeURIComponent(query);
    let links: {
        [key: string]: {
            iri: string,
            source: string,
            target: string,
            targetID: string,
            sourceID: string,
            diagram: number,
            vertexIRI: string[]
            vertexes: { [key: number]: any },
            sourceCardinality1?: string,
            sourceCardinality2?: string,
            targetCardinality1?: string,
            targetCardinality2?: string,
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
                    diagram: result.diagram.value,
                    vertexIRI: [],
                    vertexes: {},
                }
            }
            if (result.vertex) links[result.id.value].vertexIRI.push(result.vertex.value);
            if (result.sourceCard1) links[result.id.value].sourceCardinality1 = result.sourceCard1.value;
            if (result.sourceCard2) links[result.id.value].sourceCardinality2 = result.sourceCard2.value;
            if (result.targetCard1) links[result.id.value].targetCardinality1 = result.targetCard1.value;
            if (result.targetCard2) links[result.id.value].targetCardinality2 = result.targetCard2.value;
        }
    }).catch(() => {
        if (callback) callback(false);
    });

    for (let link in links) {
        if (links[link].vertexIRI.length > 0) {
            links[link].vertexes = {};
            for (let vertexIRI in links[link].vertexIRI) {
                let query = [
                    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
                    "select ?posX ?posY ?index where {",
                    "BIND(<" + vertexIRI + "> as ?iri) .",
                    "?iri og:index ?index .",
                    "?iri og:position-x ?posX .",
                    "?iri og:position-y ?posY .",
                    "}"
                ].join(" ");
                let q = endpoint + "?query=" + encodeURIComponent(query);
                await fetch(q, {headers: {'Accept': 'application/json'}}).then(response => {
                    return response.json();
                }).then(data => {
                    for (let result of data.results.bindings) {
                        links[link].vertexes[result.index.value] = {x: result.posX.value, y: result.posY.value};
                    }
                }).catch(() => {
                    if (callback) callback(false);
                });
            }
        }
        let sourceID, targetID;
        for (let id in ProjectElements) {
            if (ProjectElements[id].iri === links[link].source) sourceID = id;
            if (ProjectElements[id].iri === links[link].target) targetID = id;
            if (targetID && sourceID) break;
        }

        let convert: joint.dia.Link.Vertex[] = [];

        Object.keys(links[link].vertexes).forEach((vertex, i) => convert.push(links[link].vertexes[i]))

        let sourceCard = new Cardinality(Locale.none, Locale.none);
        sourceCard.setFirstCardinality(links[link].sourceCardinality1!)
        sourceCard.setSecondCardinality(links[link].sourceCardinality2!)
        let targetCard = new Cardinality(Locale.none, Locale.none);
        targetCard.setFirstCardinality(links[link].targetCardinality1!)
        targetCard.setSecondCardinality(links[link].targetCardinality2!);

        ProjectLinks[link] = {
            iri: links[link].iri,
            source: links[link].sourceID,
            target: links[link].targetID,
            sourceCardinality: sourceCard,
            targetCardinality: targetCard,
            vertices: convert,
            diagram: links[link].diagram
        }
        if (sourceID) {
            if (!ProjectElements[sourceID].connections.includes(link)) {
                ProjectElements[sourceID].connections.push(link);
            }
        }
    }

    if (callback) callback(true);
}