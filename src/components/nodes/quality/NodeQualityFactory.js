import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeQualityModel} from "./NodeQualityModel";
import {NodeQualityWidget} from "./NodeQualityWidget";

export class NodeQualityFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("quality");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeQualityWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeQualityModel();
    }
}