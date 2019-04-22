import React from 'react';
import {
    DefaultLabelModel,
    DefaultLinkModel, DiagramEngine
} from 'storm-react-diagrams';
import {OntoDiagramModel} from "../../diagram/OntoDiagramModel";
import {Locale} from "../../config/Locale";
import * as _ from "lodash";
import {LanguagePool} from "../../config/Variables";
import {LinkPool} from "../../config/LinkVariables";
import {Constraint} from "../constraints/Constraint";

export class LinkCommonModel extends DefaultLinkModel {
    width: number;
    color: string;
    curvyness: number;
    linkType: string;
    model: OntoDiagramModel;
    descriptor: boolean;
    dashed: boolean;

    constructor(model: OntoDiagramModel) {
        super();
        this.type = "link-common";
        this.width = 3;
        this.curvyness = 0;
        this.model = model;
        this.descriptor = false;
        this.dashed = false;
        this.names = {};
        this.notes = {};
        this.constraints = [];
        this.color = "black";
        for (let language in LanguagePool) {
            if (this.names[language] === undefined) {
                this.names[language] = "";
            }
        }
        if (this.model instanceof OntoDiagramModel) {
            this.linkType = this.model.selectedLink;
            this.addLabel(this.model.firstCardinality === Locale.none ? "" : this.model.firstCardinality);
            this.addLabel("");
            this.addLabel(this.model.secondCardinality === Locale.none ? "" : this.model.secondCardinality);
            this.addLabel("");
            if (LinkPool[this.linkType][1]){
                this.addDescriptorLabel();
            }
            this.dashed = LinkPool[this.linkType][2];
        }
        this.addListener({
            selectionChanged: event => {
                this.model.updatePanel();
            },
            entityRemoved: event => {
                this.model.nullPanel();
            }
        });
        this.addConstraint(new Constraint("self.width = 2",this.linkType));
    }

    addDescriptorLabel() {
        let labelText = "«" + this.linkType.toLowerCase() + "»";
        this.labels[1].setLabel(labelText);
        this.descriptor = true;
    }

    addConstraint(constraint: Constraint){
        this.constraints.push(constraint);
    }

    removeConstraint(constraint: Constraint){
        this.constraints.splice(this.constraints.indexOf(constraint),1);
    }

    setDashedLine() {
        this.dashed = true;
    }

    serialize() {
        return _.merge(super.serialize(), {
            width: this.width,
            color: this.color,
            curvyness: this.curvyness,
            linkType: this.linkType,
            name: this.name
        });
    }

    deSerialize(ob, engine: DiagramEngine) {
        super.deSerialize(ob, engine);
        this.color = ob.color;
        this.width = ob.width;
        this.curvyness = ob.curvyness;
        this.linkType = ob.linkType;
        this.name = ob.name;
    }

    setLabel(str: string) {
        if (this.labels.length >= 1) {
            let newLabel = new DefaultLabelModel();
            newLabel.setLabel(str);
            this.labels = [newLabel];
        } else {
            this.addLabel(str);
        }
    }

    setNameLanguage(language: string) {
        this.labels[3].setLabel(this.names[language]);
    }

    setFirstCardinality(str: string) {
        this.labels[0].setLabel(str);
    }

    setName(str: string, language: string) {
        this.names[language] = str;
    }


    setSecondCardinality(str: string) {
        this.labels[2].setLabel(str);
    }
}
