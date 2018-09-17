import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeModePortModel} from "./NodeModePortModel";

export class NodeModePortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="mode";
    }

    getNewInstance(initialConfig?: any): NodeModePortModel{
        return new NodeModePortModel();
    }
}