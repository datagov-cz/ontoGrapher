import {
    CardinalityPool,
    Diagrams,
    PackageRoot,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    PropertyPool,
    Schemes,
    Stereotypes,
    structuresShort
} from "../config/Variables";
import * as LocaleMain from "../locale/LocaleMain.json";
import {PackageNode} from "../datatypes/PackageNode";
import {AttributeObject} from "../datatypes/AttributeObject";
import {AttributeType} from "../datatypes/AttributeType";
import {getName, initLanguageObject} from "./FunctionEditVars";
import {Cardinality} from "../datatypes/Cardinality";

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
    Schemes[result] = {labels: initLanguageObject("")}
    return result;
}

export function addClass(
    id: string,
    iris: string[],
    language: string,
    scheme: string,
    pkg: PackageNode = PackageRoot,
    untitled: boolean = true,
    stereotype: boolean = true,
    names?: {}, descriptions?: {}, iriVocab?: string) {
    let result: { [key: string]: any } = {};
    result["iri"] = iris;
    result["names"] = names ? names : initLanguageObject(LocaleMain.untitled + " " + getName(iris[0], language));
    result["connections"] = [];
    result["untitled"] = untitled;
    result["descriptions"] = descriptions ? descriptions : initLanguageObject("");
    result["attributes"] = [];
    if (iriVocab) result["iriVocab"] = iriVocab;
    let propertyArray: AttributeObject[] = [];
    if (stereotype) {
        for (let iri of iris) {
            if (Stereotypes[iri].category in PropertyPool) {
                PropertyPool[Stereotypes[iri].category].forEach((attr: AttributeType) => {
                    let newAttr = new AttributeObject("", attr);
                    if (!(propertyArray.includes(newAttr))) propertyArray.push(newAttr);
                });
            }
        }
    }
    result["properties"] = propertyArray;
    let diagramArray: boolean[] = [];
    Diagrams.forEach(() => {
        diagramArray.push(false);
    });
    result["diagrams"] = [ProjectSettings.selectedDiagram];
    result["hidden"] = diagramArray;
    result["package"] = pkg;
    result["active"] = true;
    result["scheme"] = scheme;
    pkg.elements.push(id);
    ProjectElements[id] = result;
}

export function addModel(id: string, iri: string, language: string, name: string) {
    let result: { [key: string]: any } = {};
    result["iri"] = iri;
    result["names"] = initLanguageObject(LocaleMain.untitled + " " + name);
    result["connections"] = [];
    result["descriptions"] = initLanguageObject("");
    result["attributes"] = [];
    let diagramArray: boolean[] = [];
    Diagrams.forEach(() => {
        diagramArray.push(false);
    });
    result["diagrams"] = [ProjectSettings.selectedDiagram];
    result["hidden"] = diagramArray;
    result["package"] = PackageRoot;
    result["active"] = false;
    ProjectElements[id] = result;
}

export function addLink(id: string | number, iri: string, source: string, target: string) {
    let result: { [key: string]: any } = {};
    result["iri"] = iri;
    result["sourceCardinality"] = CardinalityPool[0];
    result["targetCardinality"] = CardinalityPool[0];
    result["source"] = source;
    result["target"] = target;
    result["diagram"] = ProjectSettings.selectedDiagram;
    ProjectLinks[id] = {
        iri: string,
        source: string,
        target: string,
        sourceCardinality: Cardinality,
        targetCardinality: Cardinality,
        diagram: number
    };
}
