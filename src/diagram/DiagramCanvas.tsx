// @ts-nocheck
import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/GraphElement";
import {graph, Links, ProjectElements, ProjectLinks, ProjectSettings} from "../var/Variables";
import {getName, addClass, addLink, getModelName} from "../misc/Helper";
import * as LocaleMain from "../locale/LocaleMain.json";

interface DiagramCanvasProps {
    projectLanguage: string;
    selectedLink: string;
    prepareDetails: Function;
    hideDetails: Function;
    addCell: Function;
    hide: Function;
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
                return new joint.shapes.standard.Link();
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
                        new joint.elementTools.RemoveButton({
                            useModelGeometry: true,
                            y: '0%',
                            x: '100%',
                            offset: offset,
                            // action: (evt) => {
                            //     let cell = evt.currentTarget.getAttribute("model-id");
                            //     graph.removeCells(graph.getCell(cell));
                            //     ProjectElements[cell].hidden[ProjectSettings.selectedModel] = true;
                            // }
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
            'link:mouseenter': function(linkView) {
                var infoButton = new joint.linkTools.InfoButton();
                var verticesTool = new joint.linkTools.Vertices();
                var segmentsTool = new joint.linkTools.Segments();
                var sourceArrowheadTool = new joint.linkTools.SourceArrowhead();
                var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
                var sourceAnchorTool = new joint.linkTools.SourceAnchor();
                var targetAnchorTool = new joint.linkTools.TargetAnchor();
                var removeButton = new joint.linkTools.Remove();
                var toolsView = new joint.dia.ToolsView({
                    tools: [infoButton,verticesTool,segmentsTool,sourceArrowheadTool,targetAnchorTool,targetArrowheadTool,sourceAnchorTool,removeButton]
                });
                linkView.addTools(toolsView);
            },
            'cell:mouseleave': function(cellView) {
                cellView.removeTools();
            },
            'blank:pointerdown': (evt, x, y) => {
                this.props.hideDetails();
                var data = evt.data = {};
                var cell;
                if (evt.shiftKey) {
                    cell = new joint.shapes.standard.Link();
                    cell.appendLabel({
                        attrs: {
                            text: {
                                text: Links[this.props.selectedLink].labels[this.props.projectLanguage]
                            }
                        }
                    });
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
                        } else {
                        }
                    }
                }
            },
            'link:pointerup' : (linkView, evt, x, y)=>{
                let id = linkView.model.id;
                for (let link of graph.getLinks()){
                    if (link.id === id){
                        let sid = link.getSourceElement()?.id;
                        let tid = link.getTargetElement()?.id;
                        if (sid && tid){
                            ProjectElements[sid].connections.push(link.id);
                            addLink(link.id, this.props.selectedLink, sid, tid);
                            link.appendLabel({
                                attrs: {
                                    text: {
                                        text: Links[this.props.selectedLink].labels[this.props.projectLanguage]
                                    }
                                }
                            });
                        }
                        break;
                    }
                }
            },
        });


        joint.elementTools.RemoveButton = joint.elementTools.Remove.extend({
            options:{
                action: (evt) => {
                    let id = evt.currentTarget.getAttribute("model-id");
                    for (let cell of graph.getCells()){
                        if (cell.id === id){
                            graph.removeCells(cell);
                            ProjectElements[id].hidden[ProjectSettings.selectedModel] = true;
                            break;
                        }
                    }
                    this.props.addCell();
                }
            }
        });

        joint.linkTools.InfoButton = joint.linkTools.Button.extend({
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
                const data = JSON.parse(event.dataTransfer.getData("newClass"));
                let name = "";
                if (data.type === "stereotype" && !data.package){
                    name = getModelName(data.elem, this.props.projectLanguage);
                } else if (data.type === "package"){
                    name = getName(ProjectElements[data.elem].iri, this.props.projectLanguage);
                } else {
                    name = LocaleMain.untitled + " " + getName(data.elem, this.props.projectLanguage);
                }
                let cls = new graphElement();
                // let cls = graphElement.create('rectangle').prop({
                //     size: {width: 180, height: 50},
                //     position: this.paper.clientToLocalPoint({x: event.clientX, y: event.clientY}),
                //     attrs: {
                //         label: {
                //             text: name,
                //         }
                //     }
                // });
                if (data.package) {
                    addClass(cls.id, data.elem, this.props.projectLanguage);}
                if (data.type === "package"){
                    cls = graphElement.create(data.elem);
                    ProjectElements[data.elem].hidden[ProjectSettings.selectedModel] = false;
                }
                cls.set('position',this.paper.clientToLocalPoint({x: event.clientX, y: event.clientY}));
                cls.resize(180,50);
                cls.attr({
                    label:{
                        text: name
                    },
                    pointers: {
                        pointerShape: 'rectangle'
                    },
                    body: {
                        rough: {
                            type: 'rectangle'
                        }
                    },
                    border: {
                        rough: {
                            type: 'rectangle'
                        }
                    }
                });
                cls.addTo(graph);
                //graph.addCell(cls);
                if (data.type === "package"){
                    let id = data.elem;
                    for (let link of ProjectLinks){
                        if ((link.source === id || link.target === id) && (graph.getCell(link.source && graph.getCell(link.target)))){
                            let lnk = new joint.shapes.standard.Link({id:link});
                            lnk.source({id:link.source});
                            lnk.target({id: link.target});
                            if (link.sourceCardinality.getString() !== LocaleMain.none) {
                                lnk.appendLabel({
                                    attrs: {
                                        text: {
                                            text: ProjectLinks[link].sourceCardinality.getString()
                                        }
                                    },
                                    position: {
                                        distance: 20
                                    }
                                });
                            }
                            if (ProjectLinks[link].targetCardinality.getString() !== LocaleMain.none) {
                                lnk.appendLabel({
                                    attrs: {
                                        text: {
                                            text: ProjectLinks[link].targetCardinality.getString()
                                        }
                                    },
                                    position: {
                                        distance: -20
                                    }
                                });
                            }
                            lnk.appendLabel({
                                attrs: {
                                    text: {
                                        text: Links[link].labels[this.props.projectLanguage]
                                    }
                                },
                                position: {
                                    distance: 0.5
                                }
                            });
                            lnk.addTo(graph);
                        }
                    }
                }
                this.props.addCell();
            }}
        />);

    }
}