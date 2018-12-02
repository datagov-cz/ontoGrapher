import React from 'react';
import {
    DefaultLabelModel,
    DefaultLinkModel, DiagramEngine
} from 'storm-react-diagrams';
import {CustomDiagramModel} from "../../diagram/CustomDiagramModel";
import {Locale} from "../../config/Locale";
import {LanguagePool} from "../../config/LanguagePool";



export class CommonLinkModel extends DefaultLinkModel {
    width: number;
    color: string;
    curvyness: number;
    linktype: string;
    model: CustomDiagramModel;
    descriptor: boolean;
    dashed: boolean;

    constructor(model: CustomDiagramModel){
        super();
        this.type = "link-common";
        this.width = 3;
        this.curvyness = 0;
        this.model = model;
        this.descriptor = false;
        this.dashed = false;
        this.names = {};
        for (let language in LanguagePool){
            if (this.names[language] === undefined){
                this.names[language] = "";
            }
        }
        if (this.model instanceof CustomDiagramModel){
            this.linktype = this.model.selectedLink;
            this.addLabel(this.model.firstCardinality === Locale.none ? "" : this.model.firstCardinality);
            this.addLabel("");
            this.addLabel(this.model.secondCardinality  === Locale.none ? "" : this.model.secondCardinality);
            this.addLabel("");
        }
        this.addListener({
            selectionChanged: event => {this.model.updatePanel();},
            entityRemoved: event => {this.model.nullPanel();}
        });
    }

    addDescriptorLabel(){
            let labeltext = "«"+this.linktype.toLowerCase()+"»";
            this.labels[1].setLabel(labeltext);
            this.descriptor = true;


    }

    setDashedLine(){
        this.dashed = true;
    }

    serialize() {
        return _.merge(super.serialize(), {
            width: this.width,
            color: this.color,
            curvyness: this.curvyness,
            linktype: this.linktype,
            name: this.name
        });
    }

    deSerialize(ob, engine: DiagramEngine) {
        super.deSerialize(ob, engine);
        this.color = ob.color;
        this.width = ob.width;
        this.curvyness = ob.curvyness;
        this.linktype = ob.linktype;
        this.name = ob.name;
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

    setNameLanguage(language:string){
        this.labels[3].setLabel(this.names[language]);
    }

    setFirstCardinality(str: string){
        this.labels[0].setLabel(str);
    }

    setName(str: string, language: string){
        this.names[language] = str;
    }


    setSecondCardinality(str: string){
        this.labels[2].setLabel(str);
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

