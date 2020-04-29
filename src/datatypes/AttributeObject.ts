import {AttributeType} from "./AttributeType";

export class AttributeObject {
    name: string;
    type: AttributeType;

    constructor(name: string, type: AttributeType) {
        this.name = name;
        this.type = type;
    }
}