import {Stereotype} from "./Stereotype";
import {LanguagePool} from "../../config/Variables";

export class Class {
    stereotype: Stereotype;
    names: {};
    //link: node
    connections: {};
    id: string;

    constructor(stereotype: Stereotype, name: string){
        this.stereotype = stereotype;
        this.names = {};
        for (let language in LanguagePool){
            this.names[language] = name;
        }
        this.connections = {};
    }
}