import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeQuantityPortModel} from "./NodeQuantityPortModel";

export class NodeQuantityPortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="quantity";
    }

    getNewInstance(initialConfig?: any): NodeQuantityPortModel{
        return new NodeQuantityPortModel();
    }
}