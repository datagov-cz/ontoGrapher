// @ts-nocheck
import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/GraphElement";
import {graph, ProjectElements} from "../var/Variables";
import {getName, addClass} from "../misc/Helper";
import * as LocaleMain from "../locale/LocaleMain.json";

interface DiagramCanvasProps {
    projectLanguage: string;
    selectedLink: string;
    prepareDetails: Function;
    hideDetails: Function;
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
                color: "#e3e3e3"
            },
            clickThreshold: 5,
            async: true,
            sorting: joint.dia.Paper.sorting.APPROX,
            connectionStrategy: joint.connectionStrategies.pinAbsolute,
            defaultConnectionPoint: { name: 'boundary', args: { selector: 'border' }},
            defaultLink: function() {
                return new joint.shapes.uml.Transition();
            },
            validateMagnet: function(_view, magnet, evt) {
                return magnet.getAttribute('magnet') === 'on-shift' && evt.shiftKey;
                //return magnet.getAttribute('magnet') === 'on-shift';
            }
        });

        this.paper.on({
            'element:mouseenter': function(elementView) {
                var model = elementView.model;
                var bbox = model.getBBox();
                var ellipseRadius = (1 - Math.cos(joint.g.toRad(45)));
                var offset = model.attr(['pointers', 'pointerShape']) === 'ellipse'
                    ? { x: -ellipseRadius * bbox.width / 2, y: ellipseRadius * bbox.height / 2  }
                    : { x: -3, y: 3 };

                elementView.addTools(new joint.dia.ToolsView({
                    tools: [
                        new joint.elementTools.Remove({
                            useModelGeometry: true,
                            y: '0%',
                            x: '100%',
                            offset: offset
                        }),
                        new joint.elementTools.InfoButton({
                            useModelGeometry: true,
                            y: '0%',
                            x: '4%',
                            offset: offset
                        })
                    ]
                }));
            },
            'cell:mouseleave': function(cellView) {
                cellView.removeTools();
            },
            'blank:pointerdown': (evt, x, y) => {
                this.props.hideDetails();
                var data = evt.data = {};
                var cell;
                if (evt.shiftKey) {
                    cell = new joint.shapes.uml.Transition();
                    cell.source({ x: x, y: y });
                    cell.target({ x: x, y: y });
                    cell.addTo(graph);
                    data.cell = cell;
                }
            },
            'blank:pointermove': function(evt, x, y) {
                var data = evt.data;
                var cell = data.cell;
                if (cell !== undefined){
                    if (cell.isLink()) {
                        cell.target({ x: x, y: y });
                    }
                }
            },
            'blank:pointerup' : function(evt,x,y){
                var data = evt.data;
                var cell = data.cell;
                if (cell !== undefined){
                    if (cell.isLink()) {
                        if (!("id" in cell.target())){
                            graph.removeCells(cell);
                        }
                    }
                }
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
                action: (evt) => {
                    this.props.prepareDetails(evt.currentTarget.getAttribute("model-id"));
                }
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
                let cls = graphElement.create('rectangle').prop({
                    size: {width: 180, height: 50},
                    position: this.paper.clientToLocalPoint({x: event.clientX, y: event.clientY}),
                    attrs: {
                        label: {
                            text: LocaleMain.untitled + " " + getName(data, this.props.projectLanguage),
                        }
                    }
                });
                addClass(cls.id, data, this.props.projectLanguage);
                graph.addCell(cls);
                console.log(ProjectElements);
            }}
        />);

    }
}