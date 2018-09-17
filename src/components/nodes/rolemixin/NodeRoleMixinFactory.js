import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeRoleMixinModel} from "./NodeRoleMixinModel";
import {NodeRoleMixinWidget} from "./NodeRoleMixinWidget";

export class NodeRoleMixinFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("roleMixin");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeRoleMixinWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeRoleMixinModel();
    }
}