import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeSubkindPortModel} from "./NodeSubkindPortModel";

export class NodeSubkindPortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="subkind";
    }

    getNewInstance(initialConfig?: any): NodeSubkindPortModel{
        return new NodeSubkindPortModel();
    }
}