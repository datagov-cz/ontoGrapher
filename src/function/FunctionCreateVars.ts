import {
    CardinalityPool,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Schemes,
    VocabularyElements
} from "../config/Variables";
import {initLanguageObject} from "./FunctionEditVars";
import {PackageNode} from "../datatypes/PackageNode";
import {LinkType} from "../config/Enum";
import {Locale} from "../config/Locale";

export function createValues(values: { [key: string]: string[] }, prefixes: { [key: string]: string }) {
    let result: string[] = [];
    for (const key in values) {
        const prefix = prefixes[key];
        for (const val of values[key]) {
            result.push(prefix + val);
        }
    }
    return result;
}

export function createNewElemIRI(scheme: string, name: string): string {
    return (Schemes[scheme].namespace || `${scheme}/${Locale[ProjectSettings.defaultLanguage].terms}/`) + name
        .toLowerCase()
        .trim()
        .normalize()
        .replace(/[\s\\]/g, '-')
        .replace(/[(?&)"^<>]/g, "");
}

export function getDomainOf(iriElem: string): string[] {
    let result = [];
    for (const iri in VocabularyElements) {
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
