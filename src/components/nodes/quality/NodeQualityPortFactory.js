import {DefaultPortFactory} from 'storm-react-diagrams';
import {NodeQualityPortModel} from "./NodeQualityPortModel";

export class NodeQualityPortFactory extends DefaultPortFactory {
    constructor(){
        super();
        this.type="quality";
    }

    getNewInstance(initialConfig?: any): NodeQualityPortModel{
        return new NodeQualityPortModel();
    }
}