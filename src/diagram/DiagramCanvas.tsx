// @ts-nocheck
import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/graphElement";
import {Links, ProjectElements, ProjectLinks, ProjectSettings} from "../config/Variables";
import {addClass, addLink} from "../function/FunctionCreateVars";
import {graph} from "../graph/graph";
import {
    getNewLabel,
    highlightCell,
    nameGraphElement,
    restoreDomainOfConns,
    restoreHiddenElem,
    unHighlightAll,
    unHighlightCell
} from "../function/FunctionGraph";
import {HideButton} from "../graph/elemHide";
import {ElemInfoButton} from "../graph/elemInfo";
import {LinkInfoButton} from "../graph/linkInfo";
import {RemoveButton} from "../graph/linkRemove";

interface DiagramCanvasProps {
    projectLanguage: string;
    selectedLink: string;
    prepareDetails: Function;
    hideDetails: Function;
    updateElementPanel: Function;
}

export default class DiagramCanvas extends React.Component<DiagramCanvasProps> {
    private readonly canvasRef: React.RefObject<HTMLDivElement>;
    private paper: joint.dia.Paper | undefined;
    private magnet: boolean;
    private drag: { x: any, y: any } | undefined;

    constructor(props: DiagramCanvasProps) {
        super(props);
        this.canvasRef = React.createRef();
        this.magnet = false;
        this.componentDidMount = this.componentDidMount.bind(this);
        this.drag = undefined;
    }

    resizeElem(id: string) {
        let view = this.paper?.findViewByModel(id);
        let bbox = view.getBBox();
        let cell = graph.getCell(id);
        let links = graph.getConnectedLinks(cell);
        for (let link of links) {
            if (link.getSourceCell().id === id) {
                link.source({x: bbox.x, y: bbox.y});
            } else {
                link.target({x: bbox.x, y: bbox.y});
            }
        }
        cell.resize(bbox.width, bbox.height);
        cell.position(bbox.x, bbox.y);
        unHighlightCell(cell.id);
        highlightCell(cell.id);
        for (let link of links) {
            if (link.getSourceCell() === null) {
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
            defaultConnectionPoint: {name: 'boundary', args: {selector: 'border'}},
            defaultLink: () => {
                return new joint.shapes.standard.Link();
            }
        });

        this.paper.on({
            'element:mouseenter': (elementView) => {
                let tool = ProjectElements[elementView.model.id].active ? new HideButton({
                    useModelGeometry: false,
                    x: '100%',
                    y: '0%',
                    action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                        let id = evt.currentTarget.getAttribute("model-id");
                        for (let cell of graph.getCells()) {
                            if (cell.id === id) {
                                for (let link of graph.getConnectedLinks(cell)) {
                                    ProjectLinks[link.id].vertices = link.vertices();
                                }
                                // @ts-ignore
                                ProjectElements[id].position[ProjectSettings.selectedDiagram] = cell.position();
                                cell.remove();
                                ProjectElements[id].hidden[ProjectSettings.selectedDiagram] = true;
                                break;
                            }
                        }
                        this.props.updateElementPanel();
                    }
                }) : new joint.elementTools.RemoveButton({
                    useModelGeometry: false,
                    x: '100%',
                    y: '0%',
                });
                elementView.addTools(new joint.dia.ToolsView({
                    tools: [new ElemInfoButton({
                        useModelGeometry: false,
                        y: '0%',
                        x: '0%',
                        offset: {x: 5},
                        action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                            let id = evt.currentTarget.getAttribute("model-id");
                            this.props.prepareDetails(id);
                            unHighlightAll();
                            highlightCell(id);
                        }
                    }), tool]
                }));
            },
            'link:mouseenter': function (linkView) {
                var infoButton = LinkInfoButton({
                    action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                        let id = evt.currentTarget.getAttribute("model-id");
                        this.props.prepareDetails(id);
                        unHighlightAll();
                        highlightCell(id);
                    }
                });
                var verticesTool = new joint.linkTools.Vertices();
                var segmentsTool = new joint.linkTools.Segments();
                var removeButton = new RemoveButton();
                var toolsView = new joint.dia.ToolsView({
                    tools: [verticesTool, segmentsTool, removeButton, infoButton]
                });
                linkView.addTools(toolsView);
            },
            'cell:mouseleave': function (cellView) {
                cellView.removeTools();
            },
            'blank:pointerdown': (evt, x, y) => {
                this.props.hideDetails();
                unHighlightAll();
                this.drag = {x: x, y: y}
            },
            'blank:pointermove': function (evt, x, y) {
                var data = evt.data;
                var cell = data.cell;
                if (cell !== undefined) {
                    if (cell.isLink()) {
                        cell.target({x: x, y: y});
                    }
                }
            },
            'blank:pointerup': () => {
                this.drag = undefined;
            },
            'link:pointerup': (linkView) => {
                let id = linkView.model.id;
                for (let link of graph.getLinks()) {
                    if (link.id === id) {
                        let sid = link.getSourceElement()?.id;
                        let tid = link.getTargetElement()?.id;
                        if (sid && tid) {
                            link.source({id: sid});
                            link.target({id: tid});
                            if (sid === tid) {
                                let coords = link.getSourcePoint();
                                let bbox = this.paper?.findViewByModel(sid).getBBox();
                                link.vertices([
                                    new joint.g.Point(coords.x, coords.y + 100),
                                    new joint.g.Point(coords.x + (bbox?.width / 2) + 50, coords.y + 100),
                                    new joint.g.Point(coords.x + (bbox?.width / 2) + 50, coords.y),
                                ])
                            }
                            if (typeof link.id === "string") {
                                ProjectElements[sid].connections.push(link.id);
                                addLink(link.id, this.props.selectedLink, sid, tid);
                            }
                            link.appendLabel({attrs: {text: {text: Links[this.props.selectedLink].labels[this.props.projectLanguage]}}});
                        }
                        break;
                    }
                }
            },
        });
    }

    render() {
        return (<div
            className={"canvas"}
            id={"canvas"}
            ref={this.canvasRef}
            onDragOver={(event) => {
                event.preventDefault();
            }}
            onMouseMove={(event) => {
                if (this.drag) {
                    this.paper?.translate(event.nativeEvent.offsetX - this.drag.x, event.nativeEvent.offsetY - this.drag.y);
                }
            }
            }
            onDrop={(event) => {
                // create - get name - insert - (new: add to data) - (existing: restore)
                const data = JSON.parse(event.dataTransfer.getData("newClass"));
                let cls = new graphElement();
                let label = getNewLabel(data.iri, ProjectSettings.selectedLanguage);
                if (data.type === "new") {
                    cls.set('position', this.paper?.clientToLocalPoint({x: event.clientX, y: event.clientY}));
                    if (typeof cls.id === "string") {
                        addClass(cls.id, [data.elem], this.props.projectLanguage, ProjectSettings.selectedPackage.scheme, ProjectSettings.selectedPackage);
                    }
                } else if (data.type === "existing") {
                    cls = new graphElement({id: data.id});
                    label = nameGraphElement(cls, ProjectSettings.selectedLanguage);
                    restoreHiddenElem(data.elem, cls);
                    restoreDomainOfConns();
                }

                cls.attr({label: {text: label}});
                cls.addTo(graph);
                let bbox = this.paper?.findViewByModel(cls).getBBox();
                cls.resize(bbox.width, bbox.height);

                this.props.updateElementPanel();
            }}
        />);

    }
}