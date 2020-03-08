import {Links, Namespaces, ProjectElements, Stereotypes, ViewSettings} from "../var/Variables";
import {SourceData} from "../components/SourceData";
import * as VariableLoader from "./../var/VariableLoader";
import * as LocaleMain from "../locale/LocaleMain.json";

export function getNameOfStereotype(uri:string): string{
    let stereotype = Stereotypes[uri];
    return Namespaces[stereotype.prefix] + stereotype.name;
}

export function getNameOfLink(uri:string): string{
    let stereotype = Links[uri];
    return Namespaces[stereotype.prefix] + stereotype.name;
}

export function getName(element: string, language: string){
    if (ViewSettings.display == 1){
        return getNameOfStereotype(element);
    } else {
        return Stereotypes[element].labels[language];
    }
}

export function addSTP(data: SourceData){
    Stereotypes[data.iri] = {
        labels: VariableLoader.initLanguageObject(data.name),
        descriptions: VariableLoader.initLanguageObject(data.description),
        category: data.source
    }
}

export function addClass(id: string, iri: string, language: string){
    let result: {[key: string]: any} = {};
    result["iri"] = iri;
    result["names"] = VariableLoader.initLanguageObject(LocaleMain.untitled + " " + getName(iri, language));
    result["connections"] = {};
    result["descriptions"] = VariableLoader.initLanguageObject("");
    result["attributes"] = {};
    result["diagrams"] = [];
    ProjectElements[id] = result;
}