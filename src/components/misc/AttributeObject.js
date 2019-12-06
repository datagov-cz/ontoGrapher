//deprecated
export class AttributeObject {
    first: string;
    second: string;

    constructor(first: string, second: string) {
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