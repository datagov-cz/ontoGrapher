
export class Constraint {
    statement: string;
    linkType: string;

    constructor(statement: string, linkType: string){
        this.statement = statement;
        this.linkType = linkType;
    }

    constructStatement(){
        return `
            context LinkCommonModel
                inv: self.linkType = "${this.linkType}" and ${this.statement}
                `;
    }
}
