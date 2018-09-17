import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeKindPortModel} from "./NodeKindPortModel";

export class NodeKindPortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="kind";
    }

    getNewInstance(initialConfig?: any): NodeKindPortModel{
        return new NodeKindPortModel();
    }
}