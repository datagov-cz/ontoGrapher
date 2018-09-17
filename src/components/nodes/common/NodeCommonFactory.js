import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeCommonModel} from "./NodeCommonModel";
import {NodeCommonWidget} from "./NodeCommonWidget";

export class NodeCommonFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("common");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeCommonWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeCommonModel();
    }
}