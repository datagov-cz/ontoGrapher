import {SourceData} from "./SourceData";
import {LanguagePool} from "../../config/Variables";

export class Class {
    stereotype: SourceData;
    names: {};
    //link: node
    connections: {};
    connectionsTo:  {};
    id: string;

    constructor(stereotype: SourceData, name: string){
        this.stereotype = stereotype;
        this.names = {};
        for (let language in LanguagePool){
            this.names[language] = name;
        }
        this.connections = {};
        this.connectionsTo = {};
    }
}