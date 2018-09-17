import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeCollectiveModel} from "./NodeCollectiveModel";
import {NodeCollectiveWidget} from "./NodeCollectiveWidget";

export class NodeCollectiveFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("collective");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeCollectiveWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeCollectiveModel();
    }
}