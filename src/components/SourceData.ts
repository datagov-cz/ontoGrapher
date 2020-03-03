export class SourceData {
    name: string;
    iri: string;
    description: string;
    source: string;
    constructor(name: string, iri: string, description: string, source: string){
        this.name = name;
        this.iri = iri;
        this.description = description;
        this.source = source;
    }
}