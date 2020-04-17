// @ts-nocheck
import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/GraphElement";
import {graph, Links, ProjectElements, ProjectLinks, ProjectSettings, Stereotypes} from "../var/Variables";
import {addClass, addLink, addModel, getModelName, getName, getStereotypeList} from "../misc/Helper";
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
    private drag: {x: any, y: any} | undefined;

    constructor(props: DiagramCanvasProps) {
        super(props);
        this.canvasRef = React.createRef();
        this.magnet = false;
        this.componentDidMount = this.componentDidMount.bind(this);
        this.drag = undefined;
    }

    resizeElem(id: string){
        let view = this.paper?.findViewByModel(id);
        let bbox = view.getBBox();
        let cell = graph.getCell(id);
        let links = graph.getConnectedLinks(cell);
        for (let link of links){
            if(link.getSourceCell().id === id){
                link.source({x: bbox.x, y: bbox.y});
            } else {
                link.target({x: bbox.x, y: bbox.y});
            }
        }
        cell.resize(bbox.width, bbox.height);
        cell.position(bbox.x, bbox.y);
        view.unhighlight();
        view.highlight();
        for (let link of links){
            if(link.getSourceCell() === null){
                link.source({id: id});
            } else {
                link.target({id: id});
            }
        }
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
            clickThreshold: 0,
            async: false,
            sorting: joint.dia.Paper.sorting.APPROX,
            connectionStrategy: joint.connectionStrategies.pinAbsolute,
            defaultConnectionPoint: { name: 'boundary', args: { selector: 'border' }},
            defaultLink: () => {
                let link = new joint.shapes.standard.Link();
                link.on('change', (lnk)=>{
                    if (this.highlight){
                        if (lnk.id === this.highlight.model.id){
                            this.highlight.unhighlight();
                            this.highlight.highlight();
                        }
                    }
                });
                return link;
            }
        });

        this.paper.on({
            'element:mouseenter': (elementView)=> {
                // let bbox = elementView.getBBox();
                // let model = elementView.model;
                // model.resize(bbox.width, bbox.height);
                let tool = ProjectElements[elementView.model.id].active ? new joint.elementTools.HideButton({
                    useModelGeometry: false,
                    x: '100%',
                    y: '0%',
                }) : new joint.elementTools.RemoveButton({
                    useModelGeometry: false,
                    x: '100%',
                    y: '0%',
                });
                let tools = [new joint.elementTools.InfoButton({
                    useModelGeometry: false,
                    y: '0%',
                    x: '0%',
                    offset: {
                        x: 5
                    }
                }), tool];
                elementView.addTools(new joint.dia.ToolsView({
                    tools: tools
                }));
            },
            'link:mouseenter': function(linkView) {
                var infoButton = new joint.linkTools.InfoButton();
                var verticesTool = new joint.linkTools.Vertices();
                var segmentsTool = new joint.linkTools.Segments();
                var removeButton = new joint.linkTools.Remove({
                    action: ((evt, view) =>  {
                        let id = view.model.id;
                        let sid = view.model.getSourceCell().id;
                        ProjectElements[sid].connections.splice(ProjectElements[sid].connections.indexOf(id),1);
                        //let tid = view.model.getTargetCell().id;
                        delete ProjectLinks[id];
                        view.model.remove();
                    })
                });
                var toolsView = new joint.dia.ToolsView({
                    tools: [verticesTool,segmentsTool,removeButton,infoButton]
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
                }
                //panZoom.enablePan();
                this.drag = {x: x, y: y}
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
            'blank:pointerup' : ()=>{
              //panZoom.disablePan
                this.drag = undefined;
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
                            if (sid === tid){
                                let coords = link.getSourcePoint();
                                let bbox = this.paper?.findViewByModel(sid).getBBox();
                                link.vertices([
                                    new joint.g.Point(coords.x, coords.y+100),
                                    new joint.g.Point(coords.x+(bbox?.width/2)+50, coords.y+100),
                                    new joint.g.Point(coords.x+(bbox?.width/2)+50, coords.y),
                                ])
                            }
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
                markup: [{
                    tagName: 'circle',
                    selector: 'button',
                    attributes: {
                        'r': 10,
                        'fill': '#ff1d00',
                        'cursor': 'pointer'
                    }
                },
                    {
                        tagName: 'path',
                        selector: 'icon',
                        attributes: {
                            'transform': 'scale(2)',
                            'd': 'M -3 -3 3 3 M -3 3 3 -3',
                            'fill': 'none',
                            'stroke': '#fff',
                            'stroke-width': 1,
                            'pointer-events': 'none'
                        }
                    }
                ],
                action: (evt) => {
                    let id = evt.currentTarget.getAttribute("model-id");
                    let links = graph.getConnectedLinks(graph.getCell(id));
                    for (let link of links){
                        delete ProjectLinks[link.id];
                    }
                    graph.getCell(id).remove();

                }
            }
        });


        joint.elementTools.HideButton = joint.elementTools.Button.extend({
            options:{
                markup: [{
                    tagName: 'circle',
                    selector: 'button',
                    attributes: {
                        'r': 10,
                        'fill': '#fff8e1',
                        'cursor': 'pointer'
                    }
                },
                    {
                        tagName: 'path',
                        selector: 'icon',
                        attributes: {
                            'd': 'M8.137 15.147c-.71-.857-1.146-1.947-1.146-3.147 0-2.76 2.241-5 5-5 1.201 0 2.291.435 3.148 1.145l1.897-1.897c-1.441-.738-3.122-1.248-5.035-1.248-6.115 0-10.025 5.355-10.842 6.584.529.834 2.379 3.527 5.113 5.428l1.865-1.865zm6.294-6.294c-.673-.53-1.515-.853-2.44-.853-2.207 0-4 1.792-4 4 0 .923.324 1.765.854 2.439l5.586-5.586zm7.56-6.146l-19.292 19.293-.708-.707 3.548-3.548c-2.298-1.612-4.234-3.885-5.548-6.169 2.418-4.103 6.943-7.576 12.01-7.576 2.065 0 4.021.566 5.782 1.501l3.501-3.501.707.707zm-2.465 3.879l-.734.734c2.236 1.619 3.628 3.604 4.061 4.274-.739 1.303-4.546 7.406-10.852 7.406-1.425 0-2.749-.368-3.951-.938l-.748.748c1.475.742 3.057 1.19 4.699 1.19 5.274 0 9.758-4.006 11.999-8.436-1.087-1.891-2.63-3.637-4.474-4.978zm-3.535 5.414c0-.554-.113-1.082-.317-1.562l.734-.734c.361.69.583 1.464.583 2.296 0 2.759-2.24 5-5 5-.832 0-1.604-.223-2.295-.583l.734-.735c.48.204 1.007.318 1.561.318 2.208 0 4-1.792 4-4z',
                            'fill': '#FFF',
                            'transform': 'scale(0.7) translate(-12 -12)',
                            'stroke': '#000000',
                            'stroke-width': 1,
                            'pointer-events': 'none'
                        }
                    }
                ],
                action: (evt) => {
                    let id = evt.currentTarget.getAttribute("model-id");
                    for (let cell of graph.getCells()){
                        if (cell.id === id){
                            for (let link of graph.getConnectedLinks(cell)){
                                ProjectLinks[link.id].vertices = link.vertices();
                            }
                            ProjectElements[id].position = cell.position();
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
                        'r': 10,
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
                        'transform': 'scale(1.5)',
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
        graph.on('add', (cell) =>{
            if (cell.isElement()){
                cell.on('change:position',(element)=>{
                    let links = graph.getConnectedLinks(element);
                    for (let link of links){
                        if (this.highlight){
                            if (link.id === this.highlight.model.id){
                                this.highlight.unhighlight();
                                this.highlight.highlight();
                            }
                        }
                    }
                });
            }
        })
    }
    render() {
        return (<div
            className={"canvas"}
            id={"canvas"}
            ref={this.canvasRef}
            onDragOver={(event) => {
                event.preventDefault();
            }}
            onMouseMove={(event)=>{
                if (this.drag){
                    this.paper?.translate(event.nativeEvent.offsetX - this.drag.x, event.nativeEvent.offsetY - this.drag.y);
                }
            }
            }
            onDrop={(event) => {
                const data = JSON.parse(event.dataTransfer.getData("newClass"));
                let name = "";
                if (data.type === "stereotype" && !data.package){
                    name = getModelName(data.elem, this.props.projectLanguage);
                    //name = "«"+ getModelName(data.elem, this.props.projectLanguage).toLowerCase() +"»" + "\n" + name;
                } else if (data.type === "package"){
                    name = ProjectElements[data.elem].names[this.props.projectLanguage];
                    name = getStereotypeList(ProjectElements[data.elem].iri, this.props.projectLanguage).map((str)=>"«"+str.toLowerCase()+"»\n").join("") + name;
                } else {
                    name = LocaleMain.untitled + " " + getName(data.elem, this.props.projectLanguage);
                    name = "«"+ getName(data.elem, this.props.projectLanguage).toLowerCase() +"»\n" + name;
                }
                let cls = new graphElement();
                if (data.package) {
                    addClass(cls.id, [data.elem], this.props.projectLanguage, ProjectSettings.selectedPackage.scheme, ProjectSettings.selectedPackage);
                } else if (data.type === "stereotype" && !data.package){
                    addModel(cls.id, [data.elem], this.props.projectLanguage, name);
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
                let bbox = this.paper?.findViewByModel(cls).getBBox();
                cls.resize(bbox.width, bbox.height);

                this.props.addCell();
                if (data.type === "package"){
                    let id = data.elem;
                    if (ProjectElements.position) cls.position(ProjectElements[id].position.x,ProjectElements[id].position.y);
                    if (!(ProjectElements[id].diagrams.includes(ProjectSettings.selectedDiagram))){
                        ProjectElements[id].diagrams.push(ProjectSettings.selectedDiagram)
                    }
                    for (let link in ProjectLinks){
                        if ((ProjectLinks[link].source === id || ProjectLinks[link].target === id) && (graph.getCell(ProjectLinks[link].source) && graph.getCell(ProjectLinks[link].target))){
                            let lnk = new joint.shapes.standard.Link({id: link});
                            if (ProjectLinks[link].sourceCardinality.getString() !== LocaleMain.none) {
                                lnk.appendLabel({attrs: {text: {text: ProjectLinks[link].sourceCardinality.getString()}}, position: {distance: 20}});
                            }
                            if (ProjectLinks[link].targetCardinality.getString() !== LocaleMain.none) {
                                lnk.appendLabel({attrs: {text: {text: ProjectLinks[link].targetCardinality.getString()}},position: {distance: -20}});
                            }
                            lnk.appendLabel({attrs: {text: {text: Links[ProjectLinks[link].iri].labels[this.props.projectLanguage]}},position: {distance: 0.5}});
                            lnk.source({id: ProjectLinks[link].source});
                            lnk.target({id: ProjectLinks[link].target});
                            lnk.vertices(ProjectLinks[link].vertices);
                            lnk.addTo(graph);
                        }
                    }
                }
            }}
        />);

    }
}