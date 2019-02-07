import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeCommonModel} from "./NodeCommonModel";
import {NodeCommonWidget} from "./NodeCommonWidget";
import {OntoDiagramModel} from "../../diagram/OntoDiagramModel";

export class NodeCommonFactory extends SRD.AbstractNodeFactory {
    model: OntoDiagramModel;

    constructor(model: OntoDiagramModel) {
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