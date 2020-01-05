import {DefaultLinkWidget, Toolkit} from "storm-react-diagrams";
import React from "react";
import * as _ from "lodash";
import {LabelModel} from "storm-react-diagrams";
import {Locale} from "../../config/locale/Locale";
import {LinkEndPool, LinkPool} from "../../config/Variables";

export class LinkCommonWidget extends DefaultLinkWidget {
    label: boolean;
    end: {};

    /*
        label0 : Start cardinality
        label1 : SourceData
        label2 : End cardinality
        label3 : Custom label
     */

    constructor(props) {
        super(props);
        this.label = false;
        this.end = LinkEndPool[LinkPool[this.props.link.linkType][0]];
        this.handleClick = this.handleClick.bind(this);
    }

    getAngle(px1, py1, px2, py2) {
        const x = px2 - px1;
        const y = py2 - py1;
        const hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let cos = x / hypotenuse;
        let radian = Math.acos(cos);
        let angle = 180 / (Math.PI / radian);
        if (y < 0) {
            angle = -angle;
        } else if ((y === 0) && (x < 0)) {
            angle = 180;
        }
        return angle;
    }

    generateEnd(pointIndex: number): JSX.Element {
        let x = this.props.link.points[pointIndex].x;
        let y = this.props.link.points[pointIndex].y;
        const pointOne = this.props.link.points[pointIndex - 1];
        const pointTwo = this.props.link.points[pointIndex];
        let angle = 0;
        if (pointOne != null) {
            angle = this.getAngle(pointOne.x, pointOne.y, pointTwo.x, pointTwo.y);
        }


        return (

            <g key={"point-" + this.props.link.points[pointIndex].id}
               shapeRendering="optimizeSpeed">
                <polygon
                    transform={`rotate(${angle}, ${x}, ${y})`}
                    points={`${x + this.end.x1},${y + this.end.y1} ${x + this.end.x2},${y + this.end.y2} ${x + this.end.x3},${y + this.end.y3} ${x + this.end.x4},${y + this.end.y4}`}
                    style={this.end.fill ? {fill: "black", stroke: this.props.link.color, strokeWidth: 2} : {fill: "#eeeeee", stroke: this.props.link.color, strokeWidth: 2}}
                />
                <text x={x} y={y} alignmentBaseline="middle" textAnchor="middle" transform={`rotate(${angle}, ${x}, ${y})`}
                      fill="white" pointerEvents="none">{this.end.text}</text>
                <circle
                    onMouseLeave={() => {
                        this.setState({selected: false});
                    }}
                    onMouseEnter={() => {
                        this.setState({selected: true});
                    }}
                    data-id={this.props.link.points[pointIndex].id}
                    data-linkid={this.props.link.id}
                    cx={x}
                    cy={y}
                    r={5}
                    opacity={0}
                    className={
                        "point " +
                        this.bem("__point") +
                        (this.props.link.points[pointIndex].isSelected() ? this.bem("--point-selected") : "")
                    }
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
                    shapeRendering="optimizeSpeed"
                    onMouseLeave={() => {
                        this.setState({selected: false});
                    }}
                    onMouseEnter={() => {
                        this.setState({selected: true});
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

    handleClick(event) {
        if (event.button === 0) {
            this.addPointToLink(event, 1);
        } else if (event.button === 2) {
            this.props.link.model.canvas.showContextMenu(event, this.props.link);
        }
    }

    generateLink(path: string, extraProps: any, id: string | number): JSX.Element {
        const props = this.props;

        const Bottom = React.cloneElement(
            props.diagramEngine.getFactoryForLink(this.props.link).generateLinkSegment(
                this.props.link,
                this,
                this.state.selected || this.props.link.isSelected(),
                path
            ),
            {
                ref: ref => ref && this.refPaths.push(ref)
            }
        );

        const Top = React.cloneElement(Bottom, {
            strokeLinecap: "round",
            onMouseLeave: () => {
                this.setState({selected: false});
            },
            onMouseEnter: () => {
                this.setState({selected: true});
            },
            ref: null,
            "data-linkid": this.props.link.getID(),
            strokeOpacity: this.state.selected ? 0.1 : 0,
            strokeWidth: 20,
            onContextMenu: () => {
                if (!this.props.diagramEngine.isModelLocked(this.props.link)) {
                    //event.preventDefault();
                    //this.props.link.remove();
                }
            },
            onMouseDown: this.handleClick
        });

        return (
            <g key={"link-" + id}>
                {Bottom}
                {Top}
            </g>
        );
    }

    componentDidUpdate() {
        if (this.props.link.labels.length > 0) {
            window.requestAnimationFrame(this.calculateAllLabelPositionCustom.bind(this));
        }
    }

    componentDidMount() {
        if (this.props.link.labels.length > 0) {
            window.requestAnimationFrame(this.calculateAllLabelPositionCustom.bind(this));
        }
    }

    calculateAllLabelPositionCustom() {
        _.forEach(this.props.link.labels, (label, index) => {
            this.calculateLabelPositionCustom(label, index + 1);
        });
    }

    //index = label[index-1]
    calculateLabelPositionCustom(label, index: number) {
        if (!this.refLabels[label.id]) {
            // no label? nothing to do here
            return;
        }

        const results = this.findPathAndRelativePositionToRenderLabelCustom(index);
        if (results === undefined) {
            return;
        }
        const labelDimensions = {
            width: this.refLabels[label.id].offsetWidth,
            height: this.refLabels[label.id].offsetHeight
        };

        const pathCentre = results.path.getPointAtLength(results.position);

        let y = 0;
        if (index === 2){
            y = pathCentre.y - labelDimensions.height / 2 + label.offsetY;
        } else if (index === 4){
            y = pathCentre.y - labelDimensions.height / 2 - label.offsetY;
        } else {
            y = pathCentre.y - labelDimensions.height / 2;
        }

        const labelCoordinates = {
            x: pathCentre.x - labelDimensions.width / 2 + label.offsetX,
            y: y
        };
        this.refLabels[label.id].setAttribute(
            "style",
            `transform: translate(${labelCoordinates.x}px, ${labelCoordinates.y}px);`
        );
    };

    findPathAndRelativePositionToRenderLabelCustom(index: number): { path: any; position: number } {
        // an array to hold all path lengths, making sure we hit the DOM only once to fetch this information
        const lengths = this.refPaths.map(path => path.getTotalLength());

        // calculate the point where we want to display the label
        let totalLength = lengths.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
        let labelPosition = 0;
        let offset = 30;
        switch (index) {
            case 1:
                labelPosition = offset;
                break;
            case 2:
                labelPosition = totalLength / 2;
                break;
            case 3:
                labelPosition = totalLength - offset;
                break;
            case 4:
                labelPosition = totalLength / 2;
                break;
        }
        // find the path where the label will be rendered and calculate the relative position
        let pathIndex = 0;
        while (pathIndex < this.refPaths.length) {
            if (labelPosition - lengths[pathIndex] < 0) {
                return {
                    path: this.refPaths[pathIndex],
                    position: labelPosition
                };
            }

            // keep searching
            labelPosition -= lengths[pathIndex];
            pathIndex++;
        }
    };

    generateLabel(label: LabelModel) {
        const canvas = this.props.diagramEngine.canvas;
        return (
            <foreignObject
                key={label.id}
                className={this.bem("__label")}
                width={canvas.offsetWidth}
                height={canvas.offsetHeight}
            >
                <div ref={ref => (this.refLabels[label.id] = ref)}>
                    {this.props.diagramEngine
                        .getFactoryForLabel(label)
                        .generateReactWidget(this.props.diagramEngine, label)}
                </div>
            </foreignObject>
        );
    }

    render() {
        const {diagramEngine} = this.props;
        if (!diagramEngine.nodesRendered) {
            return null;
        }

        //ensure id is present for all points on the path
        const points = this.props.link.points;
        const paths = [];

        if (this.isSmartRoutingApplicable()) {
            // first step: calculate a direct path between the points being linked
            const directPathCoords = this.pathFinding.calculateDirectPath(_.first(points), _.last(points));

            const routingMatrix = diagramEngine.getRoutingMatrix();
            // now we need to extract, from the routing matrix, the very first walkable points
            // so they can be used as origin and destination of the link to be created
            const smartLink = this.pathFinding.calculateLinkStartEndCoords(routingMatrix, directPathCoords);

            if (smartLink) {
                const {start, end, pathToStart, pathToEnd} = smartLink;

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
                            onMouseDown: this.handleClick
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
                const isHorizontal = Math.abs(points[0].x - points[1].x) > Math.abs(points[0].y - points[1].y);
                const xOrY = isHorizontal ? "x" : "y";

                //draw the smoothing
                //if the points are too close, just draw a straight line
                let margin = 50;
                if (Math.abs(points[0][xOrY] - points[1][xOrY]) < 50) {
                    margin = 5;
                }

                const pointLeft = points[0];
                const pointRight = points[1];

                //some defensive programming to make sure the smoothing is
                //always in the right direction
                // if (pointLeft[xOrY] > pointRight[xOrY]) {
                //     pointLeft = points[1];
                //     pointRight = points[0];
                // }

                paths.push(
                    this.generateLink(
                        Toolkit.generateCurvePath(pointLeft, pointRight, this.props.link.curvyness),
                        {
                            onMouseDown: this.handleClick
                        },
                        "0"
                    )
                );

                // draw the link as dangling
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
                                onMouseDown: this.handleClick
                            },
                            j
                        )
                    );
                }

                //render the circles
                for (let i = 1; i < points.length - 1; i++) {
                    paths.push(this.generatePoint(i));
                }
                paths.push(this.generateEnd(points.length - 1));
            }
        }

        this.refPaths = [];
        return (
            <g {...this.getProps()}>
                {paths}
                {_.map(this.props.link.labels, labelModel => {
                    if (!((labelModel.label === "") || (labelModel.label === Locale.none))) {
                        return this.generateLabel(labelModel);
                    }
                })}
            </g>
        );
    }
}