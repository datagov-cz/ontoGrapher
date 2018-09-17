import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeModeModel} from "./NodeModeModel";
import {NodeModeWidget} from "./NodeModeWidget";

export class NodeModeFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("mode");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeModeWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeModeModel();
    }
}