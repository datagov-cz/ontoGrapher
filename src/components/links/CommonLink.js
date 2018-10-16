import React from 'react';
import {
    AbstractLinkFactory,
    DefaultLabelModel,
    DefaultLinkModel,
    DefaultPortModel, DiagramEngine
} from 'storm-react-diagrams';
import {SubQuantityLinkWidget} from "./SubQuantityLink";
import {SubCollectionLinkWidget} from "./SubCollectionLink";
import {MemberLinkWidget} from "./MemberLink";
import {MediationLinkWidget} from "./MediationLink";
import {MaterialLinkWidget} from "./MaterialLink";
import {FormalLinkWidget} from "./FormalLink";
import {DerivationLinkWidget} from "./DerivationLink";
import {ComponentLinkWidget} from "./ComponentLink";
import {CharacterizationLinkWidget} from "./CharacterizationLink";
import {CommonLinkWidget} from "./CommonLinkWidget";
import {LinkPool} from "../../diagram/LinkPool";



export class CommonLinkModel extends DefaultLinkModel {
    width: number;
    color: string;
    curvyness: number;
    linktype: string;
    established: boolean;

    constructor(){
        super();
        this.type = "link-common";
        this.width = 3;
        this.curvyness = 0;
        this.linktype = "common";
        this.established = false;
    }

    serialize() {
        return _.merge(super.serialize(), {
            width: this.width,
            color: this.color,
            curvyness: this.curvyness,
            linktype: this.linktype
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


export class CommonLinkFactory extends AbstractLinkFactory<CommonLinkModel>{
    constructor(){
        super();
        this.type = "link-common";
    }

    getNewInstance(initialConfig?: any): CommonLinkModel{
        return new CommonLinkModel();
    }

    generateReactWidget(diagramEngine: DiagramEngine, link: CommonLinkModel): JSX.Element {
        return React.createElement(LinkPool[link.linktype],{
            link: link,
            diagramEngine: diagramEngine
        });
    }

    generateLinkSegment(model: CommonLinkModel, widget: CommonLinkWidget, selected: boolean, path:string){
        if (model.linktype === "Derivation"){
            return (

                <path className={selected ? "link-derivation--path-selected" : "link-derivation"}
                      ref={ref => {
                          this.path = ref;
                      }}
                      strokeWidth={model.width}
                      stroke="black"
                      strokeDasharray="10,10"
                      d={path}
                />

            );
        } else {
            return (

                <path className={selected ? "link-common--path-selected" : "link-common"}
                      ref={ref => {
                          this.path = ref;
                      }}
                      strokeWidth={model.width}
                      stroke="black"
                      d={path}
                />

            );
        }

    }
}

export class CommonPortModel extends DefaultPortModel{
    createLinkModel(): CommonLinkModel | null {
        return new CommonLinkModel();
    }
}