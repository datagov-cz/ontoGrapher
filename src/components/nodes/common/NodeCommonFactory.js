import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeCommonModel} from "./NodeCommonModel";
import {NodeCommonWidget} from "./NodeCommonWidget";
import {CustomDiagramModel} from "../../../diagram/CustomDiagramModel";

export class NodeCommonFactory extends SRD.AbstractNodeFactory {
    model: CustomDiagramModel;

    constructor(model: CustomDiagramModel){
        super("common");
        this.model = model;
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeCommonWidget node={node} diagramModel={this.model}/>;
    }

    getNewInstance() {
        return new NodeCommonModel(this.model);
    }
}