export class Connection{
    to: Class;
    via: string;
    constructor(to: Class, via: string){
        this.to = to;
        this.via = via;
    }
}