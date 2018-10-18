import React from 'react';
import {
    DefaultLabelModel,
    DefaultLinkModel, DiagramEngine
} from 'storm-react-diagrams';
import {CustomDiagramModel} from "../../diagram/CustomDiagramModel";



export class CommonLinkModel extends DefaultLinkModel {
    width: number;
    color: string;
    curvyness: number;
    linktype: string;
    model: CustomDiagramModel;

    constructor(model: CustomDiagramModel){
        super();
        this.type = "link-common";
        this.width = 3;
        this.curvyness = 0;
        this.model = model;
        if (this.model instanceof CustomDiagramModel){
            this.linktype = this.model.selectedLink;
            this.addLabel(this.model.firstcard);
            this.addLabel(this.model.secondcard);
        }

    }

    addDescriptorLabel(){
        if (this.labels.length < 3){
            let labeltext = "«"+this.linktype.toLowerCase()+"»";
            let label = new DefaultLabelModel();
            label.setLabel(labeltext);
            this.labels.splice(1,0,label);
        }

    }

    serialize() {
        return _.merge(super.serialize(), {
            width: this.width,
            color: this.color,
            curvyness: this.curvyness,
            linktype: this.linktype,
        });
    }

    deSerialize(ob, engine: DiagramEngine) {
        super.deSerialize(ob, engine);
        this.color = ob.color;
        this.width = ob.width;
        this.curvyness = ob.curvyness;
        this.linktype = ob.linktype;

    }

    setLabel(str: string){
        if (this.labels.length >= 1){
            let newLabel = new DefaultLabelModel();
            newLabel.setLabel(str);
            this.labels = [newLabel];
        } else {
            this.addLabel(str);
        }
    }
}


/*
CommonLinkWidget.defaultProps = {
    color: "black",
    width: 3,
    link: null,
    engine: null,
    smooth: false,
    diagramEngine: null
}

export interface CommonLinkProps extends BaseWidgetProps {
    color?: string;
    width?: number;
    smooth?: boolean;
    link: CommonLinkModel;
    diagramEngine: DiagramEngine;
    pointAdded?: (point: PointModel, event: MouseEvent) => any;
}

export interface CommonLinkState {
    selected: boolean;
}
*/

