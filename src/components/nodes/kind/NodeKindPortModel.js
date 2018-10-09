import * as _ from "lodash";
import { LinkModel, DiagramEngine, PortModel } from "storm-react-diagrams";
import {CommonLinkModel} from "../../links/CommonLink";

export class NodeKindPortModel extends PortModel {
    constructor(pos: string = "port") {
        super(pos, "kind");
        this.position = pos;
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
        return new CommonLinkModel();
    }
}