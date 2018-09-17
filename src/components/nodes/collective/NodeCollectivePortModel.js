import * as _ from "lodash";
import { LinkModel, DiagramEngine, PortModel, DefaultLinkModel } from "storm-react-diagrams";
import {MemberLinkModel} from "../../links/MemberLink";

export class NodeCollectivePortModel extends PortModel {
    constructor(pos: string = "port") {
        super(pos, "collective");
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
        return new MemberLinkModel();
    }
}