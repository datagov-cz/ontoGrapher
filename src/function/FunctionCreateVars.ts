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
import {drawGraphElement, restoreHiddenElem} from "./FunctionGraph";
import {changeDiagrams} from "./FunctionDiagram";
import {graph} from "../graph/Graph";
import {LinkType, Representation} from "../config/Enum";

export async function setupDiagrams(diagram: number = 0): Promise<boolean> {
    for (let i = 0; i < Diagrams.length; i++) {
        changeDiagrams(i);
        for (let id in ProjectElements) {
            if (ProjectElements[id].hidden[i] === false && ProjectElements[id].position[i] && ProjectElements[id].active) {
                let cls = new graphElement({id: id});
                cls.position(ProjectElements[id].position[i].x, ProjectElements[id].position[i].y);
                cls.addTo(graph);
                drawGraphElement(cls, ProjectSettings.selectedLanguage, Representation.FULL);
                restoreHiddenElem(id, cls, true);
            }
        }
    }
    changeDiagrams(diagram);
    return true;
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

export function createNewElemIRI(target: { [key: string]: any }, url: string): string {
    let result = url;
    result = result.trim().replace(/\s/g, '-').toLowerCase();
    let count = 1;
    if (result in target) {
        while ((result + "-" + count.toString(10)) in target) {
            count++;
        }
        result += "-" + count.toString(10);
    }
    return result;
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
        active: active
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