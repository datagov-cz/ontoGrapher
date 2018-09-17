import * as _ from "lodash";
import { LinkModel, DiagramEngine, PortModel, DefaultLinkModel } from "storm-react-diagrams";

export class NodeSubkindPortModel extends PortModel {
    constructor(pos: string = "port") {
        super(pos, "subkind");
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
        return new DefaultLinkModel();
    }
}