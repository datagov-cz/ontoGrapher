import {
    CardinalityPool,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    PropertyPool,
    Schemes,
    structuresShort
} from "../config/Variables";
import * as LocaleMain from "../locale/LocaleMain.json";
import {AttributeObject} from "../datatypes/AttributeObject";
import {initLanguageObject} from "./FunctionEditVars";

export function createValues(values: {[key:string]: string[]}, prefixes: {[key:string]: string}){
    let result: string[] = [];
    for (let key in values){
        let prefix = prefixes[key];
        for (let val in values[key]){
            result.push(prefix + val);
        }
    }
    return result;
}

export function createNewScheme(): string {
    let result = "https://slovník.gov.cz/" + structuresShort[ProjectSettings.knowledgeStructure] + "/" + LocaleMain.untitled;
    if (result in Schemes) {
        let count = 1;
        while ((result + "-" + count.toString(10)) in Schemes) {
            count++;
        }
        result += "-" + count.toString(10);
    }
    result = result.trim().replace(/\s/g, '-');
    Schemes[result] = {labels: initLanguageObject(""), readOnly: false}
    return result;
}

export function initProperties(scheme: string): AttributeObject[] {
    let result: AttributeObject[] = [];
    PropertyPool[scheme].forEach((atrt) => {
        result.push(atrt);
    })
    return result;
}

export function addClass(
    id: string,
    iri: string,
    untitled: boolean = true,
) {
    ProjectElements[id] = {
        iri: iri,
        connections: [],
        untitled: untitled,
        attributes: [],
        diagrams: [ProjectSettings.selectedDiagram],
        properties: initProperties(iri),
        hidden: {[ProjectSettings.selectedDiagram]: false},
        position: {[ProjectSettings.selectedDiagram]: {x: 0, y: 0}}
    }
}

export function addLink(id: string, iri: string, source: string, target: string) {
    ProjectLinks[id] = {
        iri: iri,
        source: source,
        target: target,
        sourceCardinality: CardinalityPool[0],
        targetCardinality: CardinalityPool[0],
        diagram: ProjectSettings.selectedDiagram,
        vertices: []
    };
}
