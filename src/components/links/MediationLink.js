import React from 'react';
import {
    DefaultLabelModel,
    DefaultLinkFactory,
    DefaultLinkModel,
    DefaultLinkWidget,
    DefaultPortModel, DiagramEngine, PointModel, Toolkit
} from 'storm-react-diagrams';



export class MediationLinkModel extends DefaultLinkModel {
    constructor(){
        super("link-mediation");
        this.width = 3;
        this.curvyness = 0;
        if (this.labels.length == 0){
            this.setLabel("«mediation»")
        }
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

export interface MediationLinkProps extends BaseWidgetProps {
    color?: string;
    width?: number;
    smooth?: boolean;
    link: MediationLinkModel;
    diagramEngine: DiagramEngine;
    pointAdded?: (point: PointModel, event: MouseEvent) => any;
}

export interface MediationLinkState {
    selected: boolean;
}


export class MediationLinkWidget extends DefaultLinkWidget {

    getAngle(px1, py1, px2, py2) {
        const x = px2-px1;
        const y = py2-py1;
        const hypotenuse = Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2));
        let cos = x/hypotenuse;
        let radian = Math.acos(cos);
        let angle = 180/(Math.PI/radian);
        if (y<0) {
            angle = -angle;
        } else if ((y == 0) && (x<0)) {
            angle = 180;
        }
        return angle;
    }

    generatePoint(pointIndex: number): JSX.Element {
        let x = this.props.link.points[pointIndex].x;
        let y = this.props.link.points[pointIndex].y;
        const pointOne = this.props.link.points[pointIndex-1];
        const pointTwo = this.props.link.points[pointIndex];
        let angle = 0;
        if (pointOne != null){
            angle = this.getAngle(pointOne.x, pointOne.y, pointTwo.x, pointTwo.y);
        }


        return (
            <g key={"point-" + this.props.link.points[pointIndex].id}>
                <circle
                    onMouseLeave={() => {
                        this.setState({ selected: false });
                    }}
                    onMouseEnter={() => {
                        this.setState({ selected: true });
                    }}
                    data-id={this.props.link.points[pointIndex].id}
                    data-linkid={this.props.link.id}
                    cx={x}
                    cy={y}
                    r={5}
                    opacity={.5}
                    className={
                        "point " +
                        this.bem("__point") +
                        (this.props.link.points[pointIndex].isSelected() ? this.bem("--point-selected") : "")
                    }
                />

                <polygon
                    x={x-20}
                    y={y+12}
                    transform={`rotate(${angle}, ${x}, ${y})`}
                    points={`${x - 10},${y - 8} ${x+3},${y} ${x - 10},${y + 8}`}

                />

            </g>
        );
    }
}

export class MediationLinkFactory extends DefaultLinkFactory{
    constructor(){
        super();
        this.type = "link-mediation";
    }

    getNewInstance(initialConfig?: any): MediationLinkModel{
        return new MediationLinkModel();
    }

    generateReactWidget(diagramEngine: DiagramEngine, link: MediationLinkModel): JSX.Element {
        return React.createElement(MediationLinkWidget, {
            link: link,
            diagramEngine: diagramEngine
        });
    }

    generateLinkSegment(model: MediationLinkModel, widget: MediationLinkWidget, selected: boolean, path:string){
        var markerId= Toolkit.UID();
        var markerEndUrl = "url(#"+markerId+")";
        return (

                <path className={selected ? "link-mediation--path-selected" : "link-mediation"}
                      ref={ref => {
                          this.path = ref;
                      }}
                      strokeWidth={model.width}
                      stroke="black"
                      d={path}
                      markerEnd={markerEndUrl}
                />

        );
    }
}

export class MediationPortModel extends DefaultPortModel{
    createLinkModel(): MediationLinkModel | null {
        return new MediationLinkModel();
    }
}