import * as _ from "lodash";
import { LinkModel, DiagramEngine, PortModel } from "storm-react-diagrams";
import {CustomDiagramModel} from "../../diagram/CustomDiagramModel";
import {CommonLinkModel} from "../commonlink/CommonLinkModel";

export class NodeCommonPortModel extends PortModel {
    model: CustomDiagramModel;

    constructor(pos: string = "port", model: CustomDiagramModel) {
        super(pos, "common");
        this.position = pos;
        this.model = model;
    }

    serialize() {
        return _.merge(super.serialize(), {
            position: this.position
        });
    }

    deSerialize(data: any, engine: DiagramEngine) {
        super.deSerialize(data, engine);
        this.position = data.position;
    }

    createLinkModel(): LinkModel {
        return new CommonLinkModel(this.model);
    }
}