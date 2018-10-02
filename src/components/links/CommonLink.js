import React from 'react';
import {
    AbstractLinkFactory,
    BaseWidgetProps,
    DefaultLabelModel,
    DefaultLinkModel,
    DefaultLinkWidget,
    DefaultPortModel, DiagramEngine, PointModel, Toolkit
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

export class CommonLinkWidget extends DefaultLinkWidget {


    // DOM references to the label and paths (if label is given), used to calculate dynamic positioning
    /*
    refLabels: { [id: string]: HTMLElement };
    refPaths: SVGPathElement[];


    constructor(props: CommonLinkProps) {
        super("common-link", props);

        this.refLabels = {};
        this.refPaths = [];
        this.state = {
            selected: false
        };

    }
*/
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

    generateEnd(pointIndex: number): JSX.Element {
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
                    x={this.props.link.points[pointIndex].x-20}
                    y={this.props.link.points[pointIndex].y+12}
                    transform={`rotate(${angle}, ${this.props.link.points[pointIndex].x}, ${this.props.link.points[pointIndex].y})`}
                    points={`${this.props.link.points[pointIndex].x - 10},${this.props.link.points[pointIndex].y - 8} ${this.props.link.points[pointIndex].x+3},${this.props.link.points[pointIndex].y} ${this.props.link.points[pointIndex].x - 10},${this.props.link.points[pointIndex].y + 8}`}
                />

            </g>
        );
    }

    generatePoint(pointIndex: number): JSX.Element {
        let x = this.props.link.points[pointIndex].x;
        let y = this.props.link.points[pointIndex].y;

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
            </g>
        );
    }

    render() {
        const { diagramEngine } = this.props;
        if (!diagramEngine.nodesRendered) {
            return null;
        }

        //ensure id is present for all points on the path
        var points = this.props.link.points;
        var paths = [];

        if (this.isSmartRoutingApplicable()) {
            // first step: calculate a direct path between the points being linked
            const directPathCoords = this.pathFinding.calculateDirectPath(_.first(points), _.last(points));

            const routingMatrix = diagramEngine.getRoutingMatrix();
            // now we need to extract, from the routing matrix, the very first walkable points
            // so they can be used as origin and destination of the link to be created
            const smartLink = this.pathFinding.calculateLinkStartEndCoords(routingMatrix, directPathCoords);

            if (smartLink) {
                const { start, end, pathToStart, pathToEnd } = smartLink;

                // second step: calculate a path avoiding hitting other elements
                const simplifiedPath = this.pathFinding.calculateDynamicPath(
                    routingMatrix,
                    start,
                    end,
                    pathToStart,
                    pathToEnd
                );

                paths.push(
                    //smooth: boolean, extraProps: any, id: string | number, firstPoint: PointModel, lastPoint: PointModel
                    this.generateLink(
                        Toolkit.generateDynamicPath(simplifiedPath),
                        {
                            onMouseDown: event => {
                                this.addPointToLink(event, 1);
                            }
                        },
                        "0"
                    )
                );
            }
        }

        // true when smart routing was skipped or not enabled.
        // See @link{#isSmartRoutingApplicable()}.
        if (paths.length === 0) {
            if (points.length === 2) {
                var isHorizontal = Math.abs(points[0].x - points[1].x) > Math.abs(points[0].y - points[1].y);
                var xOrY = isHorizontal ? "x" : "y";

                //draw the smoothing
                //if the points are too close, just draw a straight line
                var margin = 50;
                if (Math.abs(points[0][xOrY] - points[1][xOrY]) < 50) {
                    margin = 5;
                }

                var pointLeft = points[0];
                var pointRight = points[1];

                //some defensive programming to make sure the smoothing is
                //always in the right direction
                if (pointLeft[xOrY] > pointRight[xOrY]) {
                    pointLeft = points[1];
                    pointRight = points[0];
                }

                paths.push(
                    this.generateLink(
                        Toolkit.generateCurvePath(pointLeft, pointRight, this.props.link.curvyness),
                        {
                            onMouseDown: event => {
                                this.addPointToLink(event, 1);
                            }
                        },
                        "0"
                    )
                );

                // draw the link as dangeling
                //if (this.props.link.targetPort === null) {
                //    paths.push(this.generatePoint(1));
                //}
                paths.push(this.generateEnd(1));
            } else {
                //draw the multiple anchors and complex line instead
                for (let j = 0; j < points.length - 1; j++) {
                    paths.push(
                        this.generateLink(
                            Toolkit.generateLinePath(points[j], points[j + 1]),
                            {
                                "data-linkid": this.props.link.id,
                                "data-point": j,
                                onMouseDown: (event: MouseEvent) => {
                                    this.addPointToLink(event, j + 1);
                                }
                            },
                            j
                        )
                    );
                }

                //render the circles
                for (var i = 1; i < points.length - 1; i++) {
                    paths.push(this.generatePoint(i));
                }
                paths.push(this.generateEnd(points.length - 1));

                if (this.props.link.targetPort === null) {
                    paths.push(this.generateEnd(points.length - 1));
                }
            }
        }

        this.refPaths = [];
        return (
            <g {...this.getProps()}>
                {paths}
                {_.map(this.props.link.labels, labelModel => {
                    return this.generateLabel(labelModel);
                })}
            </g>
        );
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
        if (link.linktype == "common"){
            return React.createElement(CommonLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        } else if (link.linktype == "subquantity"){
            return React.createElement(SubQuantityLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        } else if (link.linktype == "characterization"){
            return React.createElement(CharacterizationLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        }else if (link.linktype == "component"){
            return React.createElement(ComponentLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        }else if (link.linktype == "derivation"){
            return React.createElement(DerivationLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        }else if (link.linktype == "formal"){
            return React.createElement(FormalLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        }else if (link.linktype == "material"){
            return React.createElement(MaterialLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        }else if (link.linktype == "mediation"){
            return React.createElement(MediationLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        }else if (link.linktype == "member"){
            return React.createElement(MemberLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        }else if (link.linktype == "subcollection"){
            return React.createElement(SubCollectionLinkWidget, {
                link: link,
                diagramEngine: diagramEngine
            });
        }

    }

    generateLinkSegment(model: CommonLinkModel, widget: CommonLinkWidget, selected: boolean, path:string){
        if (model.linktype == "derivation"){
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