import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeRoleModel} from "./NodeRoleModel";
import {NodeRoleWidget} from "./NodeRoleWidget";

export class NodeRoleFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("role");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeRoleWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeRoleModel();
    }
}