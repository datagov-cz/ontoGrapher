import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeCategoryPortModel} from "./NodeCategoryPortModel";

export class NodeCategoryPortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="category";
    }

    getNewInstance(initialConfig?: any): NodeCategoryPortModel{
        return new NodeCategoryPortModel();
    }
}