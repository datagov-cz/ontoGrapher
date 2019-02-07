import * as _ from "lodash";
import {LinkModel, DiagramEngine, PortModel} from "storm-react-diagrams";
import {OntoDiagramModel} from "../../diagram/OntoDiagramModel";
import {LinkCommonModel} from "../common-link/LinkCommonModel";

export class NodeCommonPortModel extends PortModel {
    model: OntoDiagramModel;

    constructor(pos: string = "port", model: OntoDiagramModel) {
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