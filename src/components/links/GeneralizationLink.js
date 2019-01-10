import {LinkCommonWidget} from "../common-link/LinkCommonWidget";
import React from "react";

export class GeneralizationLinkWidget extends LinkCommonWidget{


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


                <polygon
                    x={this.props.link.points[pointIndex].x-20}
                    y={this.props.link.points[pointIndex].y+12}
                    transform={`rotate(${angle}, ${this.props.link.points[pointIndex].x}, ${this.props.link.points[pointIndex].y})`}
                    points={`${this.props.link.points[pointIndex].x - 10},${this.props.link.points[pointIndex].y - 8} ${this.props.link.points[pointIndex].x+3},${this.props.link.points[pointIndex].y} ${this.props.link.points[pointIndex].x - 10},${this.props.link.points[pointIndex].y + 8}`}
                />
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
}