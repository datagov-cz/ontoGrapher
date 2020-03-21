// @ts-nocheck
import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/GraphElement";
import {graph, Links, ProjectElements, ProjectLinks, ProjectSettings} from "../var/Variables";
import {addClass, addLink, addmodel, getModelName, getName} from "../misc/Helper";
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
    private highlight: joint.dia.CellView;
    private magnet: boolean;

    constructor(props: DiagramCanvasProps) {
        super(props);
        this.canvasRef = React.createRef();
        this.magnet = false;
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
            // validateMagnet: (_view, magnet, evt)=> {
            //     //return this.magnet;
            //     return evt.shiftKey;
            //     //return magnet.getAttribute('magnet') === 'on-shift';
            // }
        });

        this.paper.on({
            'element:mouseenter': (elementView)=> {
                let bbox = elementView.getBBox();
                let model = elementView.model;
                model.resize(bbox.width, bbox.height);
                let tools = [new joint.elementTools.RemoveButton({
                    useModelGeometry: true,
                    x: '100%',
                    y: '0%',
                })];
                if (ProjectElements[elementView.model.id].active) {tools.push(new joint.elementTools.InfoButton({
                    useModelGeometry: true,
                    y: '0%',
                    x: '0%',
                }));}
                elementView.addTools(new joint.dia.ToolsView({
                    tools: tools
                }));
            },
            'link:mouseenter': function(linkView) {
                var infoButton = new joint.linkTools.InfoButton();
                var verticesTool = new joint.linkTools.Vertices();
                var segmentsTool = new joint.linkTools.Segments();
                var removeButton = new joint.linkTools.Remove();
                var sourceArrowheadTool = new joint.linkTools.SourceArrowhead();
                var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
                var toolsView = new joint.dia.ToolsView({
                    tools: [verticesTool,segmentsTool,sourceArrowheadTool,targetArrowheadTool,removeButton,infoButton]
                });
                linkView.addTools(toolsView);
            },
            'cell:mouseleave': function(cellView) {
                cellView.removeTools();
            },
            'blank:pointerdown': (evt, x, y) => {
                this.props.hideDetails();
                for (let cell of graph.getCells()){
                    this.paper?.findViewByModel(cell).unhighlight();
                    this.paper?.findViewByModel(cell).getBBox({useModelGeometry: true});
                }
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
            'blank:pointerup' : (evt,x,y)=>{
                // var data = evt.data;
                // var cell = data.cell;
                // if (cell !== undefined){
                //     if (cell.isLink()) {
                //         if (!("id" in cell.target())){
                //             graph.removeCells(cell);
                //         }
                //     }
                // }
                // this.magnet = false;
            },
            'link:pointerup' : (linkView, evt, x, y)=>{
                let id = linkView.model.id;
                for (let link of graph.getLinks()){
                    if (link.id === id){
                        let sid = link.getSourceElement()?.id;
                        let tid = link.getTargetElement()?.id;
                        if (sid && tid){
                            link.source({id: sid});
                            link.target({id: tid});
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
                            ProjectElements[id].hidden[ProjectSettings.selectedDiagram] = true;
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
                distance: 40,
                offset: 0,
                action: (evt) => {
                    let id = evt.currentTarget.getAttribute("model-id");
                    this.props.prepareDetails(id);
                    for (let cell of graph.getCells()){
                        this.paper?.findViewByModel(cell).unhighlight();
                    }
                    this.highlight = this.paper?.findViewByModel(graph.getCell(id));
                    this.highlight.highlight();
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
                    let id = evt.currentTarget.getAttribute("model-id");
                    this.props.prepareDetails(id);
                    for (let cell of graph.getCells()){
                        this.paper?.findViewByModel(cell).unhighlight();
                    }
                    this.highlight = this.paper?.findViewByModel(graph.getCell(id));
                    this.highlight.highlight();
                }
            }
        });

        joint.elementTools.createLink = joint.elementTools.Button.extend({
            name: 'create-link-button',
            options: {
                markup: [{
                    tagName: 'circle',
                    selector: 'button',
                    attributes: {
                        'r': 7,
                        'fill': '#ffed00',
                        'cursor': 'pointer'
                    }
                }, {
                    tagName: 'path',
                    selector: 'icon',
                    attributes: {
                        'transform': 'scale(0.4) translate(-11 -11)',
                        'd': 'M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z',
                        'fill': 'none',
                        'stroke': '#000000',
                        'stroke-width': 2,
                        'pointer-events': 'none'
                    }
                }],
                distance: 60,
                offset: 0,
                action: (evt) => {


                //     this.magnet = true;
                    // var data = evt.data = {};
                    // var cell = new joint.shapes.standard.Link();
                    // cell.appendLabel({
                    //     attrs: {
                    //         text: {
                    //             text: Links[this.props.selectedLink].labels[this.props.projectLanguage]
                    //         }
                    //     }
                    // });
                    // cell.source({ id: evt.currentTarget.getAttribute("model-id")});
                    // cell.target(this.paper.clientToLocalPoint({x: evt.clientX, y: evt.clientY}));
                    // cell.addTo(graph);
                    // data.cell = cell;
                }
            }
        });
        // let elem = new graphElement();
        // elem.resize(180,50).attr({label: {text: "example text tttttttttttttttt"}});
        // elem.position(100,100);
        // elem.addTo(graph);

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
                    //name = "«"+ getModelName(data.elem, this.props.projectLanguage).toLowerCase() +"»" + "\n" + name;
                } else if (data.type === "package"){
                    name = ProjectElements[data.elem].names[this.props.projectLanguage];
                    name = "«"+ getName(data.elem, this.props.projectLanguage).toLowerCase() +"»" + "\n" + name;
                } else {
                    name = LocaleMain.untitled + " " + getName(data.elem, this.props.projectLanguage);
                    name = "«"+ getName(data.elem, this.props.projectLanguage).toLowerCase() +"»" + "\n" + name;
                }
                let cls = new graphElement();
                if (data.package) {
                    addClass(cls.id, data.elem, this.props.projectLanguage);
                } else if (data.type === "stereotype" && !data.package){
                    addmodel(cls.id, data.elem, this.props.projectLanguage, name);
                    ProjectElements[cls.id].active = false;
                }
                if (data.type === "package"){
                    cls = graphElement.create(data.elem);
                    ProjectElements[data.elem].hidden[ProjectSettings.selectedDiagram] = false;
                }
                cls.set('position',this.paper.clientToLocalPoint({x: event.clientX, y: event.clientY}));
                cls.attr({
                    label:{
                        text: name,
                        magnet: true,
                    }
                });
                cls.addTo(graph);

                this.props.addCell();
                if (data.type === "package"){
                    if (!(ProjectElements[id].diagrams.includes(ProjectSettings.selectedDiagram))){
                        ProjectElements[id].diagrams.push(ProjectSettings.selectedDiagram)
                    }
                    let id = data.elem;
                    for (let link in ProjectLinks){
                        if ((ProjectLinks[link].source === id || ProjectLinks[link].target === id) && (graph.getCell(ProjectLinks[link].source) && graph.getCell(ProjectLinks[link].target))){
                            let lnk = new joint.shapes.standard.Link({id:link});
                            if (ProjectLinks[link].sourceCardinality.getString() !== LocaleMain.none) {
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
                                        text: Links[ProjectLinks[link].iri].labels[this.props.projectLanguage]
                                    }
                                },
                                position: {
                                    distance: 0.5
                                }
                            });
                            lnk.source({id: ProjectLinks[link].source});
                            lnk.target({id: ProjectLinks[link].target});
                            lnk.addTo(graph);
                        }
                    }
                }
            }}
        />);

    }
}