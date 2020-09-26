import {
    CardinalityPool,
    Diagrams,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Schemes,
    StructuresShort,
    VocabularyElements
} from "../config/Variables";
import * as LocaleMain from "../locale/LocaleMain.json";
import {initLanguageObject} from "./FunctionEditVars";
import {PackageNode} from "../datatypes/PackageNode";
import {graphElement} from "../graph/GraphElement";
import {nameGraphElement, restoreHiddenElem} from "./FunctionGraph";
import {changeDiagrams} from "./FunctionDiagram";
import {graph} from "../graph/Graph";
import {LinkType} from "../config/Enum";

export async function setupDiagrams(diagram: number = 0): Promise<boolean> {
    for (let i = 0; i < Diagrams.length; i++) {
        changeDiagrams(i);
        for (let id in ProjectElements) {
            if (ProjectElements[id].hidden[i] === false && ProjectElements[id].position[i]) {
                let position = ProjectElements[id].position[i];
                if (position.x !== 0 && position.y !== 0) {
                    let cls = new graphElement({id: id});
                    cls.position(ProjectElements[id].position[i].x, ProjectElements[id].position[i].y);
                    cls.addTo(graph);
                    nameGraphElement(cls, ProjectSettings.selectedLanguage);
                    restoreHiddenElem(id, cls);
                }
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

export function createNewScheme(): string {
    let result = "https://slovník.gov.cz/" + StructuresShort[ProjectSettings.knowledgeStructure] + "/" + LocaleMain.untitled;
    if (result in Schemes) {
        let count = 1;
        while ((result + "-" + count.toString(10)) in Schemes) {
            count++;
        }
        result += "-" + count.toString(10);
    }
    result = result.trim().replace(/\s/g, '-');
    Schemes[result] = {labels: initLanguageObject(""), readOnly: false, graph: result}
    return result;
}

export function createIDIRI(id: string) {
    return ProjectSettings.ontographerContext + "/" + id;
}

export function createNewElemIRI(labels: { [key: string]: string }, target: { [key: string]: any }, url?: string): string {
    let name = LocaleMain.untitled;
    for (let lang in labels) {
        if (labels[lang] !== "") {
            name = labels[lang];
            break;
        }
    }
    let result = url ? url + name : "https://slovník.gov.cz/" + StructuresShort[ProjectSettings.knowledgeStructure] + "/pojem/" + name;
    result = result.trim().replace(/\s/g, '-');
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

export function addVocabularyElement(iri: string, type?: string) {
    if (ProjectSettings.selectedPackage.scheme) {
        VocabularyElements[iri] = {
            labels: initLanguageObject(""),
            definitions: initLanguageObject(""),
            inScheme: ProjectSettings.selectedPackage.scheme,
            domain: undefined,
            range: undefined,
            types: type ? [type] : [],
            subClassOf: [],
            restrictions: [],
            connections: [],
            active: true
        }
    }
}

export function addClass(
    id: string,
    iri: string,
    pkg: PackageNode,
    untitled: boolean = true,
    active: boolean = true) {
    ProjectElements[id] = {
        iri: iri,
        connections: [],
        untitled: untitled,
        diagrams: [ProjectSettings.selectedDiagram],
        hidden: {[ProjectSettings.selectedDiagram]: false},
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