import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeCategoryModel} from "./NodeCategoryModel";
import {NodeCategoryWidget} from "./NodeCategoryWidget";

export class NodeCategoryFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("category");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeCategoryWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeCategoryModel();
    }
}