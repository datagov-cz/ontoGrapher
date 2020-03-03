import {SourceData} from "./SourceData";
import {Languages} from "../var/Variables";

export class Class {
    stereotype: SourceData;
    names: {[key:string]: any};
    //link: node
    connections: {};
    connectionsTo:  {};
    id: string;

    constructor(stereotype: SourceData, name: string){
        this.id = "";
        this.stereotype = stereotype;
        this.names = {};
        for (let language in Languages){
            this.names[language] = name;
        }
        this.connections = {};
        this.connectionsTo = {};
    }
}