import {
    CardinalityPool,
    Diagrams,
    PackageRoot,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    PropertyPool,
    Schemes,
    StructuresShort,
    VocabularyElements
} from "../config/Variables";
import * as LocaleMain from "../locale/LocaleMain.json";
import {AttributeObject} from "../datatypes/AttributeObject";
import {addRelationships, initLanguageObject} from "./FunctionEditVars";
import {PackageNode} from "../datatypes/PackageNode";
import {graphElement} from "../graph/GraphElement";
import {getSettings} from "../interface/SPARQLInterface";
import {nameGraphElement, restoreHiddenElem} from "./FunctionGraph";
import {changeDiagrams} from "./FunctionDiagram";
import {graph} from "../graph/Graph";

export async function setupDiagrams(diagram: number = 0): Promise<boolean> {
    return await getSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint).then((result) => {
        if (result) {
            if (!ProjectSettings.initialized) addRelationships();
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
        } else return false;
    }).catch((error) => {
        console.log(error);
        return false;
    });
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

export function addProperties(iri: string, attrs: { name: string, iri: string, type: string | string[] }[]) {
    if (!(iri in PropertyPool)) PropertyPool[iri] = [];
    attrs.forEach(attr => {
        PropertyPool[iri].push(new AttributeObject(attr.name, Array.isArray(attr.type) ? attr.type[0] : attr.type, Array.isArray(attr.type), attr.iri));
    });
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

export function initProperties(scheme: string): AttributeObject[] {
    let result: AttributeObject[] = [];
    if (PropertyPool[scheme]) {
        PropertyPool[scheme].forEach((atrt) => {
            result.push(atrt);
        })
    }
    return result;
}

export function addElemsToPackage(scheme: string) {
    let pkg = new PackageNode(Schemes[scheme].labels, PackageRoot, false, scheme);
    for (let iri in VocabularyElements) {
        if (VocabularyElements[iri].inScheme === scheme) {
            let elem = new graphElement();
            if (typeof elem.id === "string") {
                addClass(elem.id, iri, pkg, false, false);
            }
        }
    }
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

export function addVocabularyElement(id: string, iri: string, type?: string) {
    if (ProjectSettings.selectedPackage.scheme) {
        VocabularyElements[iri] = {
            labels: initLanguageObject(""),
            definitions: initLanguageObject(""),
            inScheme: ProjectSettings.selectedPackage.scheme,
            domain: undefined,
            range: undefined,
            types: type ? [type] : [],
            subClassOf: [],
            restrictions: []
        }
    }
}

export function addClass(
    id: string,
    iri: string,
    pkg: PackageNode,
    untitled: boolean = true,
    active: boolean = true,
    property?: string) {
    ProjectElements[id] = {
        iri: iri,
        connections: [],
        untitled: untitled,
        attributes: [],
        diagrams: [ProjectSettings.selectedDiagram],
        properties: property ? initProperties(property) : [],
        hidden: {[ProjectSettings.selectedDiagram]: false},
        position: {[ProjectSettings.selectedDiagram]: {x: 0, y: 0}},
        package: pkg,
        active: active
    }
    pkg.elements.push(id);
}

export function addLink(id: string, iri: string, source: string, target: string, type: string = "default") {
    ProjectLinks[id] = {
        iri: iri,
        source: source,
        target: target,
        sourceCardinality: CardinalityPool[0],
        targetCardinality: CardinalityPool[0],
        diagram: ProjectSettings.selectedDiagram,
        vertices: [],
        type: type
    }
}