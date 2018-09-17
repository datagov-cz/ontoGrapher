import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeCollectivePortModel} from "./NodeCollectivePortModel";

export class NodeCollectivePortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="collective";
    }

    getNewInstance(initialConfig?: any): NodeCollectivePortModel{
        return new NodeCollectivePortModel();
    }
}