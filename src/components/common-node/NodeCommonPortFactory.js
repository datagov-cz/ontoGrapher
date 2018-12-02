import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeCommonPortModel} from "./NodeCommonPortModel";

export class NodeCommonPortFactory extends DefaultPortFactory {

    constructor(){
        super();
        this.type="common";
    }

    getNewInstance(initialConfig?: any): NodeCommonPortModel{
        return new NodeCommonPortModel();
    }
}