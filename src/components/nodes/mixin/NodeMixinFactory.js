import * as SRD from "storm-react-diagrams";
import * as React from "react";
import {NodeMixinModel} from "./NodeMixinModel";
import {NodeMixinWidget} from "./NodeMixinWidget";

export class NodeMixinFactory extends SRD.AbstractNodeFactory {
    constructor(){
        super("mixin");
    }

    generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
        return <NodeMixinWidget node={node}/>;
    }

    getNewInstance() {
        return new NodeMixinModel();
    }
}