import {Namespaces, Stereotypes} from "../var/Variables";

export function getNameOfStereotype(uri:string): string{
    let stereotype = Stereotypes[uri];
    return Namespaces[stereotype.prefix] + stereotype.name;
}