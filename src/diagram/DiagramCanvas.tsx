// @ts-nocheck
import React from 'react';
import * as joint from 'jointjs';
import {DiagramModel} from "./DiagramModel";
import {getName} from "../misc/Helper";
import {graph, Links, selectedCell} from "../var/Variables";

interface DiagramCanvasProps {
    projectLanguage: string;
    selectedLink: string;
    prepareDetails: Function;
}

interface DiagramPropsState {

}

export default class DiagramCanvas extends React.Component<DiagramCanvasProps, DiagramPropsState>{
    private readonly canvasRef: React.RefObject<HTMLDivElement>;
    private paper: joint.dia.Paper | undefined;

    constructor(props: DiagramCanvasProps) {
        super(props);
        this.canvasRef = React.createRef();
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount(): void {
        const node = (this.canvasRef.current! as HTMLElement);

        this.paper = new joint.dia.Paper({
            el: node,
            model: graph,
            width: "auto",
            height: "100vh",
            gridSize: 1,
            linkPinning: false,
            background: {
                color: 'rgba(0,0,0,0.1)'
            }
        });

        joint.elementTools.InfoButton = joint.elementTools.Button.extend({
            name: 'info-button',
            options: {
                markup: [{
                    tagName: 'circle',
                    selector: 'button',
                    attributes: {
                        'r': 7,
                        'fill': '#001DFF',
                        'cursor': 'pointer'
                    }
                }, {
                    tagName: 'path',
                    selector: 'icon',
                    attributes: {
                        'd': 'M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4',
                        'fill': 'none',
                        'stroke': '#FFFFFF',
                        'stroke-width': 2,
                        'pointer-events': 'none'
                    }
                }],
                distance: 60,
                offset: 0,
                action: function(evt) {
                    console.log(this);
                }
            }
        });

        this.paper.on({
            'link:mouseenter': function(linkView) {
                linkView.addTools(new joint.dia.ToolsView({
                    tools: [
                        new joint.linkTools.Vertices({ snapRadius: 0 }),
                        new joint.linkTools.SourceArrowhead(),
                        new joint.linkTools.TargetArrowhead(),
                        new joint.linkTools.Remove({
                            distance: 20
                        })
                    ]
                }));
            },
            'element:mouseenter': function(elementView) {
                var model = elementView.model;

                elementView.addTools(new joint.dia.ToolsView({
                    tools: [
                        new joint.elementTools.Remove({
                            useModelGeometry: true,
                            y: '0%',
                            x: '100%'
                        }),
                        new joint.elementTools.InfoButton({
                            useModelGeometry: true,
                            y: '0%',
                            x: '0%'
                        })
                    ]
                }));
            },
            'cell:mouseleave': function(cellView) {
                cellView.removeTools();
            },
            'blank:pointerdown': function(evt, x, y) {
                var data = evt.data = {};
                var cell;
                if (evt.shiftKey) {
                    cell = new joint.shapes.standard.Link();
                    cell.source({ x: x, y: y });
                    cell.target({ x: x, y: y });
                } else return;
                cell.addTo(graph);
                data.cell = cell;
            },
            'blank:pointermove': function(evt, x, y) {
                var data = evt.data;
                var cell = data.cell;
                if (cell.isLink()) {
                    cell.target({ x: x, y: y });
                } else {
                    var bbox = new g.Rect(data.x, data.y, x - data.x, y - data.y);
                    bbox.normalize();
                    cell.set({
                        position: { x: bbox.x, y: bbox.y },
                        size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
                    });
                }
            }
        });

        graph.on('add', (cell)=>{
            if (cell.isLink()){
                cell.appendLabel({
                    attrs: {
                        text:{
                            text: Links[this.props.selectedLink].labels[this.props.projectLanguage]
                        }
                    }
                });
            }
        });
    }
    render() {
        return (<div
            className={"canvas"}
            ref={this.canvasRef}
            onDragOver={(event) => {
                event.preventDefault();
            }}
            onDrop={(event) => {
                const data = event.dataTransfer.getData("newClass");
                let cls = new joint.shapes.standard.Rectangle({
                    size: {width: 180, height: 50},
                    position: this.paper.clientToLocalPoint({x: event.clientX, y: event.clientY})
                });
                cls.attr({
                   body:{
                       fill: 'white',
                       magnet: true
                   },
                   label:{
                       text: getName(data, this.props.projectLanguage),
                       fill: 'black'
                   }
                });
                graph.addCell(cls);
            }}
        />);

    }
}