
export class Constraint {
    statement: string;
    linkType: string;
    description: string;

    constructor(statement: string, linkType: string, description: string){
        this.statement = statement;
        this.linkType = linkType;
        this.description = description;
    }

    constructStatement(){
        return `
            context LinkCommonModel
                inv: self.linkType = "${this.linkType}" and ${this.statement}
                `;
    }

    getDescription(){
        return this.description;
    }

    setDescription(description: string){
        this.description = description;
    }

}
