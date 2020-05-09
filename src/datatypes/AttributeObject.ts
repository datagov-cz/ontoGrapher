export class AttributeObject {
	name: string;
	type: string;
	array: boolean;
	iri: string;
	value: string;

	constructor(name: string, type: string, array: boolean = false, iri: string = "") {
		this.name = name;
		this.type = type;
		this.array = array;
		this.iri = iri;
		this.value = "";
	}
}