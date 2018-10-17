import * as React from "react";
import {NodeCommonModel} from "./NodeCommonModel";
import { PortWidget } from "storm-react-diagrams";
import {CustomDiagramModel} from "../../diagram/CustomDiagramModel";
import Modal from 'react-modal';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import {LanguagePool} from "../../diagram/LanguagePool";
import {ModalDialogue, ModalTabList} from "../../diagram/ModalLayout";

export interface NodeCommonWidgetProps {
    node: NodeCommonModel;
    diagramModel: CustomDiagramModel;
    size?: number;
}

export interface NodeCommonWidgetState {}

export class NodeCommonWidget extends React.Component<NodeCommonWidgetProps, NodeCommonWidgetState>{
    constructor(props: NodeCommonWidgetProps){
        super(props);
        console.log(this.modal);
        this.createModal = this.createModal.bind(this);
    }

    changeName(str: string){
        this.props.node.changeName(str);
    }

    getName(str: string){
        return this.props.node.names[str];
        /*
         for (let name of this.props.node.names){
            if (name.first === str){
                return name.second;
            }
        }
         return "undefined";*/
    }

    getAttributes(str: string){
        return this.props.node.attributes[str];
    }

    createModal(){
        this.child.openModal();
    }

    render(){
        let attrkey = 0;
        let height = 48;
        let name = this.getName(this.props.diagramModel.language);
        let attrs = this.getAttributes(this.props.diagramModel.language);
        height += attrs.length * 15;
        let select = "black";
        if (this.props.node.selected){
            select = "blue";
        }
        const attrsmap = attrs.map((attr) =>
            <tspan key={attrkey++} x="5px" dy="15px">{attr.first + ": " + attr.second}</tspan>
        );
        return (
            <div className={this.props.node.type} width={this.props.size} height={height} onDoubleClick={this.createModal}>
                <ModalDialogue ref={instance => {this.child = instance;}} openFunc={this.createModal} node={this.props.node}/>
                <svg
                    width={this.props.size}
                    height={height}>

                    <g>
                        <rect fill="#ffffff" stroke={select} strokeWidth="3" width={this.props.size} height={height}/>
                        <text width={this.props.size} textAnchor="middle" dominantBaseline="hanging" x="50%" y="5px" fill="#000000">{"«"+this.props.node.stereotype+"»"}</text>
                        <line x1="0" x2={this.props.size} y1="20px" y2="20px" strokeWidth="1" stroke="#000000"/>
                        <text width={this.props.size} textAnchor="middle" dominantBaseline="hanging" x="50%" y="25px" fill="#000000">{name}</text>
                        <text width={this.props.size} textAnchor="start" dominantBaseline="hanging" x="5px" y="30px" fill="#000000">
                            {attrsmap}
                        </text>
                    </g>
                </svg>
                <div style={{position: "absolute",
                    zIndex: 10,
                    top: height / 2 - 8,
                    left: -8
                }}
                >
                <PortWidget name="left" node={this.props.node}/>
                </div>
                <div style={{position: "absolute",
                    zIndex: 10,
                    left: this.props.size / 2 - 8,
                    top: -8
                }}
                >
                    <PortWidget name="top" node={this.props.node}/>
                </div>
                <div style={{position: "absolute",
                    zIndex: 10,
                    left: this.props.size - 8,
                    top: height / 2 - 8
                }}
                >
                    <PortWidget name="right" node={this.props.node}/>
                </div>
                <div style={{position: "absolute",
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