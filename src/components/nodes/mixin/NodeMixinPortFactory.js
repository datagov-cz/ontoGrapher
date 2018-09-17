import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeMixinPortModel} from "./NodeMixinPortModel";

export class NodeMixinPortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="mixin";
    }

    getNewInstance(initialConfig?: any): NodeMixinPortModel{
        return new NodeMixinPortModel();
    }
}