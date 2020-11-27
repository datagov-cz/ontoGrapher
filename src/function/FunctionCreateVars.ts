import {
    CardinalityPool,
    Diagrams,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    VocabularyElements
} from "../config/Variables";
import {initLanguageObject} from "./FunctionEditVars";
import {PackageNode} from "../datatypes/PackageNode";
import {graphElement} from "../graph/GraphElement";
import {restoreElems} from "./FunctionGraph";
import {changeDiagrams} from "./FunctionDiagram";
import {graph} from "../graph/Graph";
import {LinkType, Representation} from "../config/Enum";
import {drawGraphElement} from "./FunctionDraw";

export function setupDiagrams(diagram: number = 0) {
    for (let i = 0; i < Diagrams.length; i++) {
        changeDiagrams(i);
        for (let id in ProjectElements) {
            if (ProjectElements[id].hidden[i] === false && ProjectElements[id].position[i] && ProjectElements[id].active) {
                let cls = new graphElement({id: id});
                cls.position(ProjectElements[id].position[i].x, ProjectElements[id].position[i].y);
                cls.addTo(graph);
                drawGraphElement(cls, ProjectSettings.selectedLanguage, Representation.FULL);
            }
        }
        restoreElems();
    }
    changeDiagrams(diagram);
}

export function createValues(values: { [key: string]: string[] }, prefixes: { [key: string]: string }) {
    let result: string[] = [];
    for (let key in values) {
        let prefix = prefixes[key];
        for (let val of values[key]) {
            result.push(prefix + val);
        }
    }
    return result;
}

export function createNewElemIRI(scheme: string, name: string): string {
    return (scheme.substring(0, scheme.lastIndexOf("/") + 1) + "pojem/" + name)
        .trim().replace(/\s/g, '-').toLowerCase();
}

export function getDomainOf(iriElem: string): string[] {
    let result = [];
    for (let iri in VocabularyElements) {
        if (VocabularyElements[iri].domain) {
            if (VocabularyElements[iri].domain === iriElem) {
                result.push(iri);
            }
        }
    }
    return result;
}

export function addVocabularyElement(iri: string, scheme: string, types?: string[]) {
    VocabularyElements[iri] = {
        labels: initLanguageObject(""),
        altLabels: [],
        definitions: initLanguageObject(""),
        inScheme: scheme,
        domain: undefined,
        range: undefined,
        types: types ? types : [],
        subClassOf: [],
        restrictions: [],
        connections: [],
        active: true,
        topConcept: scheme
    }
}

export function addClass(
    id: string,
    iri: string,
    pkg: PackageNode,
    active: boolean = true) {
    ProjectElements[id] = {
        iri: iri,
        connections: [],
        diagrams: [ProjectSettings.selectedDiagram],
        hidden: {[ProjectSettings.selectedDiagram]: true},
        position: {[ProjectSettings.selectedDiagram]: {x: 0, y: 0}},
        package: pkg,
        active: active,
        selectedLabel: initLanguageObject("")
    }
    pkg.elements.push(id);
}

export function addLink(id: string, iri: string, source: string, target: string, type: number = LinkType.DEFAULT) {
    ProjectLinks[id] = {
        iri: iri,
        source: source,
        target: target,
        sourceCardinality: CardinalityPool[0],
        targetCardinality: CardinalityPool[0],
        type: type,
        vertices: [],
        active: true
    }
}