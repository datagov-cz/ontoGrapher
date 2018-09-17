import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeSubkindModel} from "./NodeSubkindModel";
import {NodeSubkindWidget} from "./NodeSubkindWidget";

export class NodeSubkindFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("subkind");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeSubkindWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeSubkindModel();
    }
}