import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodePhasePortModel} from "./NodePhasePortModel";

export class NodePhasePortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="phase";
    }

    getNewInstance(initialConfig?: any): NodePhasePortModel{
        return new NodePhasePortModel();
    }
}