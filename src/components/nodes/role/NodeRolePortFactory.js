import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeRolePortModel} from "./NodeRolePortModel";

export class NodeRolePortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="role";
    }

    getNewInstance(initialConfig?: any): NodeRolePortModel{
        return new NodeRolePortModel();
    }
}