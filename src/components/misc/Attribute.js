import {AttributeType} from "./AttributeType";

export class Attribute {
    attributeType: AttributeType;
    value: string;

    constructor(attributeType: AttributeType, value: string){
        this.attributeType = attributeType;
        this.value = value;
    }
}