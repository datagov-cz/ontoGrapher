import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeKindModel} from "./NodeKindModel";
import {NodeKindWidget} from "./NodeKindWidget";

export class NodeKindFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("kind");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeKindWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeKindModel();
    }
}