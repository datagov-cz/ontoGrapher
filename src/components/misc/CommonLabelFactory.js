import {DefaultLabelFactory} from "storm-react-diagrams";
import {DiagramEngine} from "storm-react-diagrams";
import {DefaultLabelModel} from "storm-react-diagrams";
import React from "react";
import {CommonLabelWidget} from "./CommonLabelWidget";

export class CommonLabelFactory extends DefaultLabelFactory{
    constructor() {
        super("default");
    }

    generateReactWidget(diagramEngine: DiagramEngine, label: DefaultLabelModel): JSX.Element {
        return <CommonLabelWidget model={label} />;
    }

    getNewInstance(initialConfig?: any): DefaultLabelModel {
        return new DefaultLabelModel();
    }
}