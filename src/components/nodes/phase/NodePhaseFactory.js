import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodePhaseModel} from "./NodePhaseModel";
import {NodePhaseWidget} from "./NodePhaseWidget";

export class NodePhaseFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("phase");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodePhaseWidget node={node}/>;
    }

    getNewInstance() {
        return new NodePhaseModel();
    }
}