import React from 'react';
import {DefaultLabelModel, DefaultLinkModel, DiagramEngine, PortModel, LinkModelListener} from 'storm-react-diagrams';
import {OntoDiagramModel} from "../../diagram/OntoDiagramModel";
import {Locale} from "../../config/locale/Locale";
import * as _ from "lodash";
import {LanguagePool, LinkPool} from "../../config/Variables";
import {Constraint} from "../misc/Constraint";
import {Cardinality} from "../misc/Cardinality";

export class LinkCommonModel extends DefaultLinkModel {
    width: number;
    color: string;
    curvyness: number;
    linkType: string;
    model: OntoDiagramModel;
    descriptor: boolean;
    dashed: boolean;
    sourceCardinality: Cardinality;
    targetCardinality: Cardinality;
    linkEnd: string;
    labeled: boolean;
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
        this.sourceCardinality = new Cardinality(Locale.none,Locale.none);
        this.targetCardinality = new Cardinality(Locale.none,Locale.none);
        for (let language in LanguagePool) {
            if (this.names[language] === undefined) {
                this.names[language] = "";
                this.notes[language] = "";
            }
        }
        if (this.model instanceof OntoDiagramModel) {
            this.linkType = this.model.selectedLink;
            this.addLabel(this.model.firstCardinality.getString() === Locale.none ? "" : this.model.firstCardinality);
            this.addLabel("");
            this.addLabel(this.model.secondCardinality.getString() === Locale.none ? "" : this.model.secondCardinality);
            this.addLabel("");
            if (LinkPool[this.linkType][1]){
                this.addDescriptorLabel();
            }
            this.linkEnd = LinkPool[this.linkType][0];
            this.labeled = LinkPool[this.linkType][1];
            this.dashed = LinkPool[this.linkType][2];
            this.constraints = LinkPool[this.linkType][3];
            this.iri = LinkPool[this.linkType][4];
            this.description = LinkPool[this.linkType][5];
            this.source = LinkPool[this.linkType][6];
        }
        this.addListener({
            selectionChanged: event => {
                this.model.updatePanel();
            },
            entityRemoved: event => {
                this.model.nullPanel();
            }
        });
    }

    addDescriptorLabel() {
        let labelText = "«" + this.linkType.toLowerCase() + "»";
        this.labels[1].setLabel(labelText);
        this.descriptor = true;
    }

    createConstraint(constraint: Constraint){
        this.constraints.push(constraint);
    }

    removeConstraint(constraint: Constraint){
        this.constraints.splice(this.constraints.indexOf(constraint),1);
    }

    removeConstraintByIndex(index: number){
        this.constraints.splice(index,1);
    }

    setTargetPort(port: PortModel) {
        if (port !== null) {
            port.addLink(this);
        }
        if (this.targetPort !== null) {
            this.targetPort.removeLink(this);
        }
        this.targetPort = port;
        this.iterateListeners((listener: LinkModelListener, event) => {
            if (listener.targetPortChanged) {
                listener.targetPortChanged({ ...event, port: port });
            }
        });
        if (this.targetPort !== null){
            this.getSourceNode().class.connections[this.getID()] = this.targetPort.getNode().getID();
            //console.log(this.getSourceNode().class.connections);
        }
    }

    remove() {
        delete this.getSourceNode().class.connections[this.getID()];
        if (this.sourcePort) {
            this.sourcePort.removeLink(this);
        }
        if (this.targetPort) {
            this.targetPort.removeLink(this);
        }
        super.remove();
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
            name: this.name,
            names: this.names,
            sourceCardinality: this.sourceCardinality,
            targetCardinality: this.targetCardinality,
            dashed: this.dashed,
            notes: this.notes,
            constraints: this.constraints,
            descriptor: this.descriptor,
            linkEnd: this.linkEnd,
            labeled: this.labeled,
            iri: this.iri,
            description: this.description,
            source: this.source
        });
    }

    deSerialize(ob, engine: DiagramEngine) {
        super.deSerialize(ob, engine);
        this.color = ob.color;
        this.width = ob.width;
        this.curvyness = ob.curvyness;
        this.linkType = ob.linkType;
        this.name = ob.name;
        this.names = ob.names;
        this.sourceCardinality = ob.sourceCardinality;
        this.targetCardinality = ob.targetCardinality;
        this.dashed = ob.dashed;
        this.notes = ob.notes;
        this.constraints = [];
        for (let constraint of ob.constraints){
            this.constraints.push(new Constraint(constraint.statement,constraint.linkType));
        }
        this.descriptor = ob.descriptor;
        this.linkEnd = ob.linkEnd;
        this.labeled = ob.labeled;
        this.iri = ob.iri;
        this.description = ob.description;
        this.source = ob.source;
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

    getSourceCardinality(){
        return this.sourceCardinality.getString();
    }

    getTargetCardinality(){
        return this.targetCardinality.getString();
    }

    getLinktype(){
        return this.linkType;
    }

    getName(language: string){
        return this.names[language];
    }

    getSourceNode(){
        return this.getSourcePort().getParent();
    }

    getTargetNode(){
        return this.getTargetPort().getParent();
    }
}
