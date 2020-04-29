export class AttributeType {
    name: string;
    iri: string;
    type: string;
    array: boolean;

    constructor(name: string, iri: string, type: string, array: boolean) {
        this.name = name;
        this.iri = iri;
        this.type = type;
        this.array = array;
    }
}