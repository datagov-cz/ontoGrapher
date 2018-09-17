import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeRelatorPortModel} from "./NodeRelatorPortModel";

export class NodeRelatorPortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="relator";
    }

    getNewInstance(initialConfig?: any): NodeRelatorPortModel{
        return new NodeRelatorPortModel();
    }
}