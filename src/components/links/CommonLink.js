import React from 'react';
import {
    DefaultLabelModel,
    DefaultLinkFactory,
    DefaultLinkModel,
    DefaultLinkWidget,
    DefaultPortModel, DiagramEngine, PointModel, Toolkit
} from 'storm-react-diagrams';



export class CommonLinkModel extends DefaultLinkModel {
    constructor(){
        super("link-common");
        this.width = 3;
        this.curvyness = 0;
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


export class CommonLinkWidget extends DefaultLinkWidget {

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

export class CommonLinkFactory extends DefaultLinkFactory{
    constructor(){
        super();
        this.type = "link-common";
    }

    getNewInstance(initialConfig?: any): CommonLinkModel{
        return new CommonLinkModel();
    }

    generateReactWidget(diagramEngine: DiagramEngine, link: CommonLinkModel): JSX.Element {
        return React.createElement(CommonLinkWidget, {
            link: link,
            diagramEngine: diagramEngine
        });
    }

    generateLinkSegment(model: CommonLinkModel, widget: CommonLinkWidget, selected: boolean, path:string){
        var markerId= Toolkit.UID();
        var markerEndUrl = "url(#"+markerId+")";
        return (

            <path className={selected ? "link-common--path-selected" : "link-common"}
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

export class CommonPortModel extends DefaultPortModel{
    createLinkModel(): CommonLinkModel | null {
        return new CommonLinkModel();
    }
}