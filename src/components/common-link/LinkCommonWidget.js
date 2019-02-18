import {DefaultLinkWidget, Toolkit} from "storm-react-diagrams";
import React from "react";

export class LinkCommonWidget extends DefaultLinkWidget {
    label: boolean;

    constructor(props) {
        super(props);
        this.label = false;
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
            <g key={"point-" + this.props.link.points[pointIndex].id}>
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
        var props = this.props;

        var Bottom = React.cloneElement(
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

        var Top = React.cloneElement(Bottom, {
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
                    event.preventDefault();
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

        const labelCoordinates = {
            x: pathCentre.x - labelDimensions.width / 2 + label.offsetX,
            y: index === 2 ? pathCentre.y - labelDimensions.height / 2 + label.offsetY : pathCentre.y - labelDimensions.height / 2 - label.offsetY
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
        let offset = 20;
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

    render() {
        const {diagramEngine} = this.props;
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
                for (var i = 1; i < points.length - 1; i++) {
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
                    if (labelModel.label !== "") {
                        return this.generateLabel(labelModel);
                    }
                })}
            </g>
        );
    }
}