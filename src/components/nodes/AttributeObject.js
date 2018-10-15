export class AttributeObject {
    first: string;
    second: [];

    constructor(first: string){
        this.first = first;
        this.second = [];
    }

    getFirst(){
        return this.first;
    }

    getSecond(){
        return this.second;
    }
    addSecond(add: string){
        this.second.push(add);
    }
    removeSecond(remove: string){
        this.second.splice(this.second.indexOf(remove),1);
    }
    getSecondByIndex(index: number){
        return this.second[index];
    }
}