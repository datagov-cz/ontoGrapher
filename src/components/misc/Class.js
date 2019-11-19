import {Stereotype} from "./Stereotype";

export class Class {
    stereotype: Stereotype;
    name: string;
    connections: [];

    constructor(stereotype: Stereotype, name: string){
        this.stereotype = stereotype;
        this.name = name;
        this.connections = [];
    }
}