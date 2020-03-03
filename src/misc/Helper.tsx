import {Links, Namespaces, Stereotypes, ViewSettings} from "../var/Variables";
import {SourceData} from "../components/SourceData";
import * as VariableLoader from "./../var/VariableLoader";

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