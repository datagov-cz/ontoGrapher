import * as React from "react";
import {NodeCommonModel} from "./NodeCommonModel";
import {PortWidget} from "storm-react-diagrams";
import {OntoDiagramModel} from "../../diagram/OntoDiagramModel";

export interface NodeCommonWidgetProps {
    node: NodeCommonModel;
    diagramModel: OntoDiagramModel;
    size?: number;
}

export interface NodeCommonWidgetState {
}

export class NodeCommonWidget extends React.Component<NodeCommonWidgetProps, NodeCommonWidgetState> {
    constructor(props: NodeCommonWidgetProps) {
        super(props);
    }

    getName(language: string) {
        return this.props.node.getNameByLanguage(language);
    }

    getAttributes(language: string) {
        return this.props.node.getAttributesByLanguage(language);
    }

    render() {
        let attrkey = 0;
        let height = 48;
        let name = this.getName(this.props.node.model.language);
        let attrs = this.getAttributes(this.props.node.model.language);
        height += attrs.length * 15;
        let select = "black";
        if (this.props.node.selected) {
            select = "blue";
        }
        const attrsmap = attrs.map((attr) =>
            <tspan key={attrkey++} x="5px" dy="15px">{attr.first + ": " + attr.second}</tspan>
        );
        return (
            <div className={this.props.node.type} width={this.props.size} height={height}>

                <svg
                    width={this.props.size}
                    height={height}
                    shapeRendering="optimizeSpeed"
                >

                    <g>
                        <rect fill="#ffffff" stroke={select} strokeWidth="4" width={this.props.size} height={height}/>
                        <text width={this.props.size} textAnchor="middle" dominantBaseline="hanging" x="50%" y="5px"
                              fill="#000000">{"«" + this.props.node.stereotype + "»"}</text>
                        <line x1="0" x2={this.props.size} y1="20px" y2="20px" strokeWidth="1" stroke="#000000"/>
                        <text width={this.props.size} textAnchor="middle" dominantBaseline="hanging" x="50%" y="25px"
                              fill="#000000">{name}</text>
                        <text width={this.props.size} textAnchor="start" dominantBaseline="hanging" x="5px" y="30px"
                              fill="#000000">
                            {attrsmap}
                        </text>
                    </g>
                </svg>
                <div style={{
                    position: "absolute",
                    zIndex: 10,
                    top: height / 2 - 8,
                    left: -8
                }}
                >
                    <PortWidget name="left" node={this.props.node}/>
                </div>
                <div style={{
                    position: "absolute",
                    zIndex: 10,
                    left: this.props.size / 2 - 8,
                    top: -8
                }}
                >
                    <PortWidget name="top" node={this.props.node}/>
                </div>
                <div style={{
                    position: "absolute",
                    zIndex: 10,
                    left: this.props.size - 8,
                    top: height / 2 - 8
                }}
                >
                    <PortWidget name="right" node={this.props.node}/>
                </div>
                <div style={{
                    position: "absolute",
                    zIndex: 10,
                    left: this.props.size / 2 - 8,
                    top: height - 8
                }}
                >
                    <PortWidget name="bottom" node={this.props.node}/>
                </div>
            </div>
        );
    }
}

NodeCommonWidget.defaultProps = {
    size: 150,
    node: null
};

export var NodeCommonWidgetFactory = React.createFactory(NodeCommonWidget);