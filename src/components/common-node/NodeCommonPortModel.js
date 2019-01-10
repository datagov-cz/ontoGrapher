import * as _ from "lodash";
import { LinkModel, DiagramEngine, PortModel } from "storm-react-diagrams";
import {CustomDiagramModel} from "../../diagram/CustomDiagramModel";
import {LinkCommonModel} from "../common-link/LinkCommonModel";

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
        return new LinkCommonModel(this.model);
    }
}