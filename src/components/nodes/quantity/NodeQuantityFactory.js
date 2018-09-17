import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeQuantityModel} from "./NodeQuantityModel";
import {NodeQuantityWidget} from "./NodeQuantityWidget";

export class NodeQuantityFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("quantity");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeQuantityWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeQuantityModel();
    }
}