import {DefaultLabelFactory} from "storm-react-diagrams";
import {DiagramEngine} from "storm-react-diagrams";
import {DefaultLabelModel} from "storm-react-diagrams";
import React from "react";
import {LabelCommonWidget} from "./LabelCommonWidget";

export class LabelCommonFactory extends DefaultLabelFactory {
    constructor() {
        super("default");
    }

    generateReactWidget(diagramEngine: DiagramEngine, label: DefaultLabelModel): JSX.Element {
        return <LabelCommonWidget model={label}/>;
    }

    getNewInstance(initialConfig?: any): DefaultLabelModel {
        return new DefaultLabelModel();
    }
}