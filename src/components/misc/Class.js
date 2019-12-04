import {Stereotype} from "./Stereotype";

export class Class {
    stereotype: Stereotype;
    name: string;
    //link: node
    connections: {};

    constructor(stereotype: Stereotype, name: string){
        this.stereotype = stereotype;
        this.name = name;
        this.connections = {};
    }
}