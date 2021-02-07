import {
    Diagrams,
    Links,
    PackageRoot,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Schemes
} from "../config/Variables";
import {initLanguageObject, parsePrefix} from "../function/FunctionEditVars";
import * as joint from "jointjs";
import {Cardinality} from "../datatypes/Cardinality";
import * as _ from "lodash";
import {createRestriction} from "../function/FunctionRestriction";
import {LinkType} from "../config/Enum";
import {Locale} from "../config/Locale";
import {setSchemeColors} from "../function/FunctionGetVars";
import {processQuery} from "./TransactionInterface";
import {RestrictionConfig} from "../config/RestrictionConfig";

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
    requiredValues?: string[]): Promise<boolean> {
    if (!(source in Schemes)) await getScheme(source, endpoint, readOnly);

    let result: {
        [key: string]: {
            labels: { [key: string]: string },
            definitions: { [key: string]: string },
            altLabels: { label: string, language: string }[]
            types: string[],
            inScheme: string,
            domain?: string,
            range?: string,
            subClassOf: string[],
            restrictions: [],
            type: number,
            topConcept?: string;
            character?: string;
            inverseOf?: string;
        }
    } = {};

    const query = [
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "PREFIX a-popis-dat-pojem: <http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/>",
        "PREFIX z-sgov-pojem: <https://slovník.gov.cz/základní/pojem/>",
        "SELECT DISTINCT ?term ?termLabel ?termAltLabel ?termType ?termDefinition ?termDomain ?termRange ?topConcept ?inverseOf ?character ?restriction ?restrictionPred ?onProperty ?onClass ?target ?subClassOf",
        "WHERE {",
        graph && "GRAPH <" + graph + "> {",
        !subPropertyOf && "?term skos:inScheme <" + source + ">.",
        requiredType ? "?term a ?termType." : "OPTIONAL {?term a ?termType.}",
        subPropertyOf && "?term rdfs:subPropertyOf <" + subPropertyOf + ">.",
        requiredTypes && "VALUES ?termType {<" + requiredTypes.join("> <") + ">}",
        requiredValues && "VALUES ?term {<" + requiredValues.join("> <") + ">}",
        "OPTIONAL {?term skos:prefLabel ?termLabel.}",
        "OPTIONAL {?term skos:altLabel ?termAltLabel.}",
        "OPTIONAL {?term skos:definition ?termDefinition.}",
        "OPTIONAL {?term z-sgov-pojem:charakterizuje ?character.}",
        "OPTIONAL {?term rdfs:domain ?termDomain.}",
        "OPTIONAL {?term rdfs:range ?termRange.}",
        "OPTIONAL {?term rdfs:subClassOf ?subClassOf. }",
        "OPTIONAL {?term owl:inverseOf ?inverseOf. }",
        "OPTIONAL {?topConcept skos:hasTopConcept ?term. }",
        "OPTIONAL {?term rdfs:subClassOf ?restriction. ",
        "?restriction a owl:Restriction .",
        "?restriction owl:onProperty ?onProperty.",
        "OPTIONAL {?restriction owl:onClass ?onClass.}",
        "?restriction ?restrictionPred ?target.",
        "filter (?restrictionPred in (<" + Object.keys(RestrictionConfig).join(">, <") + ">))}",
        "}",
        graph && "}",
    ].join(" ");
    return await processQuery(endpoint, query).then(
        response => response.json()
    ).then(data => {
        if (data.results.bindings.length === 0) return false;
        for (const row of data.results.bindings) {
            if (!(row.term.value in result)) {
                if (getSubProperties) fetchConcepts(endpoint, source, sendTo, readOnly, graph, getSubProperties, row.term.value, requiredType, requiredTypes, requiredValues);
                result[row.term.value] = {
                    labels: initLanguageObject(""),
                    definitions: initLanguageObject(""),
                    altLabels: [],
                    types: [],
                    inScheme: source,
                    subClassOf: [],
                    restrictions: [],
                    type: LinkType.DEFAULT
                }
            }
            if (row.termType && !(result[row.term.value].types.includes(row.termType.value))) result[row.term.value].types.push(row.termType.value);
            if (row.termLabel) {
                if (!(row.termLabel['xml:lang'] in result[row.term.value].labels))
                    result[row.term.value].labels[row.termLabel['xml:lang']] = "";
                result[row.term.value].labels[row.termLabel['xml:lang']] = row.termLabel.value;
            }
            if (row.termAltLabel) {
                if (!(result[row.term.value].altLabels.find(
                    (alt: { label: string; language: string; }) => alt.label === row.termAltLabel.value && alt.language === row.termAltLabel['xml:lang'])))
                    result[row.term.value].altLabels
                        .push({label: row.termAltLabel.value, language: row.termAltLabel['xml:lang']});
            }
            if (row.termDefinition) {
                if (!(row.termDefinition['xml:lang'] in result[row.term.value].definitions))
                    result[row.term.value].definitions[row.termDefinition['xml:lang']] = "";
                result[row.term.value].definitions[row.termDefinition['xml:lang']] = row.termDefinition.value;
            }
            if (row.termDomain) result[row.term.value].domain = row.termDomain.value;
            if (row.termRange) result[row.term.value].range = row.termRange.value;
            if (row.character) result[row.term.value].character = row.character.value;
            if (row.topConcept) result[row.term.value].topConcept = row.topConcept.value;
            if (row.subClassOf && row.subClassOf.type !== "bnode" && !(result[row.term.value].subClassOf.includes(row.subClassOf.value)))
                result[row.term.value].subClassOf.push(row.subClassOf.value);
            if (row.restriction && Object.keys(Links).includes(row.onProperty.value))
                createRestriction(result[row.term.value].restrictions, row.term.value, row.restrictionPred.value, row.onProperty.value, row.target,
                    row.onClass ? row.onClass.value : undefined);
            if (row.inverseOf)
                result[row.term.value].inverseOf = row.inverseOf.value;
        }
        Object.assign(sendTo, result);
        return true;
    }).catch((e) => {
        console.log(e);
        return false;
    });
}

export async function getAllTypes(iri: string, endpoint: string, targetTypes: string[], targetSubClass: string[], init: boolean = false, link?: string, source?: boolean): Promise<boolean> {
    let subClassOf: string[] = init ? [iri] : _.cloneDeep(targetSubClass);
    while (subClassOf.length > 0) {
        const subc = subClassOf.pop();
        if (subc) {
            if (!(targetSubClass.includes(subc))) targetSubClass.push(subc);
            const query = [
                "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
                "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
                "SELECT DISTINCT ?type ?subClass ?restriction ?onProperty ?onClass ?target ?restrictionPred",
                "WHERE {",
                "<" + subc + "> a ?type.",
                "<" + subc + "> rdfs:subClassOf ?subClass.",
                "OPTIONAL {<" + subc + "> rdfs:subClassOf ?restriction. ",
                "?restriction a owl:Restriction .",
                "?restriction owl:onProperty ?onProperty.",
                "?restriction owl:onClass ?onClass.",
                "?restriction ?restrictionPred ?target.",
                "filter (?restrictionPred in (owl:minQualifiedCardinality, owl:maxQualifiedCardinality))}",
                "}",
            ].join(" ");
            const result = await processQuery(endpoint, query).then(response => {
                return response.json();
            }).then(data => {
                let newCardinality = new Cardinality(
                    ProjectSettings.defaultCardinality.getFirstCardinality(),
                    ProjectSettings.defaultCardinality.getSecondCardinality());
                for (const result of data.results.bindings) {
                    if (!(targetTypes.includes(result.type.value))) targetTypes.push(result.type.value);
                    if (!(subClassOf.includes(result.subClass.value)) &&
                        result.subClass.type !== "bnode") subClassOf.push(result.subClass.value);
                    if (result.restriction && link && source !== undefined && result.onProperty.value === link) {
                        result.restrictionPred.value === parsePrefix("owl", "minQualifiedCardinality") ?
                            newCardinality.setFirstCardinality(result.target.value) :
                            newCardinality.setSecondCardinality(result.target.value);
                        source ? Links[link].defaultSourceCardinality = newCardinality : Links[link].defaultTargetCardinality = newCardinality;
                    }
                }
                if (link && Links[link].inverseOf && Links[link].inverseOf in Links) {
                    Links[Links[link].inverseOf].defaultSourceCardinality = Links[link].defaultTargetCardinality;
                    Links[Links[link].inverseOf].defaultTargetCardinality = Links[link].defaultSourceCardinality;
                }
                return true;
            }).catch((e) => {
                console.log(e);
                return false;
            });
            if (!result) return false;
        } else break;
    }
    return true;
}

export async function getScheme(iri: string, endpoint: string, readOnly: boolean, graph?: string): Promise<boolean> {
    const query = [
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
    return await processQuery(endpoint, query).then(response => {
        return response.json();
    }).then(data => {
        if (data.results.bindings.length === 0) return false;
        for (const result of data.results.bindings) {
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
        return true;
    }).catch((e) => {
        console.log(e);
        return false;
    });
}

export async function getElementsConfig(contextIRI: string, contextEndpoint: string): Promise<boolean> {
    let elements: {
        [key: string]: {
            id: "",
            active: boolean,
            diagramPosition: { [key: number]: { x: number, y: number } },
            hidden: { [key: number]: boolean },
            diagrams: number[],
            selectedName: { [key: string]: string },
            graph: string
        }
    } = {}
    const query = [
        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
        "select ?id ?iri ?active ?diagram ?index ?hidden ?posX ?posY ?name ?graph where {",
        "graph ?graph {",
        "?elem a og:element .",
        "?elem og:context <" + contextIRI + ">.",
        "?elem og:iri ?iri .",
        "?elem og:id ?id .",
        "?elem og:active ?active .",
        "?elem og:diagram ?diagram .",
        "optional {?elem og:name ?name.}",
        "optional {?diagram og:index ?index.",
        "?diagram og:hidden ?hidden.",
        "?diagram og:position-x ?posX.",
        "?diagram og:position-y ?posY.",
        "}}",
        "<" + contextIRI + "> <https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-kontext> ?graph.}"
    ].join(" ");
    return await processQuery(contextEndpoint, query).then(response => {
        return response.json();
    }).then(data => {
        for (const result of data.results.bindings) {
            const iri = result.iri.value;
            if (!(iri in elements)) {
                elements[iri] = {
                    id: result.id.value,
                    diagrams: [],
                    active: result.active.value === "true",
                    diagramPosition: {},
                    hidden: {},
                    selectedName: initLanguageObject(""),
                    graph: result.graph.value
                }
            }
            if (result.name && !(elements[iri].selectedName[result.name['xml:lang']]))
                elements[iri].selectedName[result.name['xml:lang']] = result.name.value;
            if (result.index && !(elements[iri].diagrams.includes(parseInt(result.index.value)))) {
                elements[iri].diagrams.push(parseInt(result.index.value));
                elements[iri].diagramPosition[parseInt(result.index.value)] = {
                    x: parseInt(result.posX.value),
                    y: parseInt(result.posY.value)
                }
                elements[iri].hidden[parseInt(result.index.value)] = result.hidden.value === "true";
            }
        }
        for (let iri in elements) {
            let id = elements[iri].id;
            let pkg = PackageRoot.children.find(pkg => Schemes[pkg.scheme].graph === elements[iri].graph);
            if (pkg) {
                ProjectElements[id] = {
                    iri: iri,
                    connections: [],
                    diagrams: elements[iri].diagrams,
                    hidden: elements[iri].hidden,
                    position: elements[iri].diagramPosition,
                    package: pkg,
                    active: elements[iri].active,
                    selectedLabel: elements[iri].selectedName
                }
                pkg.elements.push(id);
            }
        }
        return true;
    }).catch((e) => {
        console.log(e);
        return false;
    });
}

export async function getSettings(contextIRI: string, contextEndpoint: string): Promise<boolean> {
    let contextInstance = ProjectSettings.contextIRI.substring(ProjectSettings.contextIRI.lastIndexOf("/"));
    let query = [
        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
        "select ?diagram ?index ?name ?color ?active where {",
        "BIND(<" + ProjectSettings.ontographerContext + "> as ?ogContext).",
        "graph ?ogContext {",
        "?diagram og:context <" + contextIRI + "> .",
        "?diagram og:index ?index .",
        "?diagram og:name ?name .",
        "optional {?diagram og:active ?active}",
        "optional {<" + ProjectSettings.ontographerContext + contextInstance + "> og:viewColor ?color}",
        "}",
        "}"
    ].join(" ");
    return await processQuery(contextEndpoint, query).then(response => {
        return response.json();
    }).then(data => {
        for (let result of data.results.bindings) {
            if (!(parseInt(result.index.value) in Diagrams)) {
                Diagrams[parseInt(result.index.value)] = {
                    name: Locale[ProjectSettings.viewLanguage].untitled,
                    active: result.active ? result.active.value === "true" : true,
                    origin: {x: 0, y: 0},
                    scale: 1
                }
            }
            Diagrams[parseInt(result.index.value)].name = result.name.value;
            if (result.color) ProjectSettings.viewColorPool = result.color.value;
        }
        setSchemeColors(ProjectSettings.viewColorPool);
        return true;
    }).catch((e) => {
        console.log(e);
        return false;
    });
}

export async function getLinksConfig(contextIRI: string, contextEndpoint: string): Promise<boolean> {
    let query = [
        "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
        "select ?id ?iri ?sourceID ?targetID ?source ?active ?target ?sourceCard1 ?sourceCard2 ?targetCard1 ?targetCard2 ?diagram ?vertex ?type ?index ?posX ?posY where {",
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
        "optional {?link og:vertex ?vertex.",
        "?vertex og:index ?index.",
        "?vertex og:position-x ?posX.",
        "?vertex og:position-y ?posY.",
        "optional {?vertex og:diagram ?diagram.}",
        "}}"
    ].join(" ");
    let links: {
        [key: string]: {
            iri: string,
            source: string,
            target: string,
            targetID: string,
            sourceID: string,
            vertexIRI: {
                [key: string]: {
                    index: number,
                    x: number,
                    y: number,
                    diagram: number
                }
            },
            vertices: { [key: number]: { [key: number]: { x: number, y: number }, } },
            sourceCardinality1: string,
            sourceCardinality2: string,
            targetCardinality1: string,
            targetCardinality2: string,
            active: boolean,
            type: number,
        }
    } = {};
    return await processQuery(contextEndpoint, query).then(response => {
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
                    vertexIRI: {},
                    vertices: {},
                    type: result.type.value === "default" ? LinkType.DEFAULT : LinkType.GENERALIZATION,
                    sourceCardinality1: result.sourceCard1.value,
                    sourceCardinality2: result.sourceCard2.value,
                    targetCardinality1: result.targetCard1.value,
                    targetCardinality2: result.targetCard2.value,
                }
            }
            if (result.vertex && !(result.vertex.value in links[result.id.value].vertexIRI))
                links[result.id.value].vertexIRI[result.vertex.value] = {
                    index: parseInt(result.index.value),
                    x: parseInt(result.posX.value),
                    y: parseInt(result.posY.value),
                    diagram: result.diagram ? parseInt(result.diagram.value) : -1
                };
        }
        for (let link in links) {
            let convert: { [key: number]: joint.dia.Link.Vertex[] } = {};
            let keys = Object.keys(links[link].vertexIRI);
            if (keys.length > 0) {
                let skipDeprecated = keys.find((iri: string) => iri.includes("/diagram"));
                for (let vertexIRI of keys) {
                    if (!vertexIRI.includes("/diagram") && skipDeprecated) continue;
                    let vertex = links[link].vertexIRI[vertexIRI];
                    let diagram: number = vertex.diagram !== -1 ? vertex.diagram : 0;
                    if (!(diagram in convert)) convert[diagram] = [];
                    convert[diagram][vertex.index] = {x: vertex.x, y: vertex.y};
                }
            }
            let sourceID, targetID;
            for (let id in ProjectElements) {
                if (ProjectElements[id].iri === links[link].source) sourceID = id;
                if (ProjectElements[id].iri === links[link].target) targetID = id;
                if (targetID && sourceID) break;
            }

            if (targetID && sourceID) {
                let sourceCard = new Cardinality("", "");
                let targetCard = new Cardinality("", "");
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
    }).catch((e) => {
        console.log(e);
        return false;
    });
}