import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeRelatorModel} from "./NodeRelatorModel";
import {NodeRelatorWidget} from "./NodeRelatorWidget";

export class NodeRelatorFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("relator");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeRelatorWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeRelatorModel();
    }
}