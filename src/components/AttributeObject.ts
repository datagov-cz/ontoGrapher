import {AttributeType} from "./AttributeType";

export class AttributeObject {
    first: string;
    second: AttributeType;

    constructor(first: string, second: AttributeType) {
        this.first = first;
        this.second = second;
    }

    getFirst() {
        return this.first;
    }

    getName(){
        return this.first;
    }

    getType(){
        return this.second;
    }

    getSecond() {
        return this.second;
    }
}