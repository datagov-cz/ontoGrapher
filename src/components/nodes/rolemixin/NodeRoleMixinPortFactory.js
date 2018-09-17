import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeRoleMixinPortModel} from "./NodeRoleMixinPortModel";

export class NodeRoleMixinPortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="roleMixin";
    }

    getNewInstance(initialConfig?: any): NodeRoleMixinPortModel{
        return new NodeRoleMixinPortModel();
    }
}