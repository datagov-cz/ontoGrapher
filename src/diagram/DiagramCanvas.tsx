import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/graphElement";
import {Links, ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {getModelName, getName, getStereotypeList} from "../function/FunctionEditVars";
import * as LocaleMain from "../locale/LocaleMain.json";
import {addClass, addLink, addModel} from "../function/FunctionCreateVars";
import {graph} from "../graph/graph";
import {highlightCell, unHighlightCell} from "../function/FunctionGraph";

interface DiagramCanvasProps {
    projectLanguage: string;
    selectedLink: string;
    prepareDetails: Function;
    hideDetails: Function;
    addCell: Function;
    hide: Function;
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
            'link:mouseenter': function (linkView) {
                var infoButton = new joint.linkTools.InfoButton();
                var verticesTool = new joint.linkTools.Vertices();
                var segmentsTool = new joint.linkTools.Segments();
                var removeButton = new joint.linkTools.RemoveButton();
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
                for (let cell of graph.getCells()) {
                    unHighlightCell(cell.id);
                }
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
                const data = JSON.parse(event.dataTransfer.getData("newClass"));
                let name = "";
                if (data.type === "stereotype" && !data.package) {
                    name = getModelName(data.elem, this.props.projectLanguage);
                    //labels = "«"+ getModelName(data.elem, this.props.projectLanguage).toLowerCase() +"»" + "\n" + labels;
                } else if (data.type === "package") {
                    name = ProjectElements[data.elem].names[this.props.projectLanguage];
                    name = getStereotypeList(ProjectElements[data.elem].iri, this.props.projectLanguage).map((str) => "«" + str.toLowerCase() + "»\n").join("") + name;
                } else {
                    name = LocaleMain.untitled + " " + getName(data.elem, this.props.projectLanguage);
                    name = "«" + getName(data.elem, this.props.projectLanguage).toLowerCase() + "»\n" + name;
                }
                let cls = new graphElement();
                if (data.package) {
                    addClass(cls.id, [data.elem], this.props.projectLanguage, ProjectSettings.selectedPackage.scheme, ProjectSettings.selectedPackage);
                } else if (data.type === "stereotype" && !data.package) {
                    addModel(cls.id, data.elem, this.props.projectLanguage, name);
                    ProjectElements[cls.id].active = false;
                }
                if (data.type === "package") {
                    cls = graphElement.create(data.elem);
                    ProjectElements[data.elem].hidden[ProjectSettings.selectedDiagram] = false;
                }
                cls.set('position', this.paper.clientToLocalPoint({x: event.clientX, y: event.clientY}));
                cls.attr({
                    label: {
                        text: name,
                        magnet: true,
                    }
                });
                cls.addTo(graph);
                let bbox = this.paper?.findViewByModel(cls).getBBox();
                cls.resize(bbox.width, bbox.height);

                this.props.addCell();
                if (data.type === "package") {
                    let id = data.elem;
                    if (ProjectElements.position) cls.position(ProjectElements[id].position.x, ProjectElements[id].position.y);
                    if (!(ProjectElements[id].diagrams.includes(ProjectSettings.selectedDiagram))) {
                        ProjectElements[id].diagrams.push(ProjectSettings.selectedDiagram)
                    }
                    for (let link in ProjectLinks) {
                        if ((ProjectLinks[link].source === id || ProjectLinks[link].target === id) && (graph.getCell(ProjectLinks[link].source) && graph.getCell(ProjectLinks[link].target))) {
                            let lnk = new joint.shapes.standard.Link({id: link});
                            if (ProjectLinks[link].sourceCardinality.getString() !== LocaleMain.none) {
                                lnk.appendLabel({
                                    attrs: {text: {text: ProjectLinks[link].sourceCardinality.getString()}},
                                    position: {distance: 20}
                                });
                            }
                            if (ProjectLinks[link].targetCardinality.getString() !== LocaleMain.none) {
                                lnk.appendLabel({
                                    attrs: {text: {text: ProjectLinks[link].targetCardinality.getString()}},
                                    position: {distance: -20}
                                });
                            }
                            lnk.appendLabel({
                                attrs: {text: {text: Links[ProjectLinks[link].iri].labels[this.props.projectLanguage]}},
                                position: {distance: 0.5}
                            });
                            lnk.source({id: ProjectLinks[link].source});
                            lnk.target({id: ProjectLinks[link].target});
                            lnk.vertices(ProjectLinks[link].vertices);
                            lnk.addTo(graph);
                        }
                    }
                }

                for (let iri in VocabularyElements) {
                    if (VocabularyElements[iri].domain && VocabularyElements[iri].range) {
                        let domain = VocabularyElements[iri].domain;
                        let range = VocabularyElements[iri].range;
                        let domainCell = undefined;
                        let rangeCell = undefined;
                        for (let cell of graph.getElements()) {
                            if (ProjectElements[cell.id].iri === domain) {
                                domainCell = cell.id;
                            }
                            if (ProjectElements[cell.id].iri === range) {
                                rangeCell = cell.id;
                            }
                        }
                        if (domainCell && rangeCell) {
                            let link = new joint.shapes.standard.Link();
                            link.source({id: domainCell});
                            link.target({id: rangeCell});
                            link.appendLabel({
                                attrs: {text: {text: VocabularyElements[iri].labels[this.props.projectLanguage]}},
                                position: {distance: 0.5}
                            });
                            let insert = true;
                            for (let lnk in ProjectLinks) {
                                if (ProjectLinks[lnk].source === domainCell &&
                                    ProjectLinks[lnk].target === rangeCell &&
                                    ProjectLinks[lnk].iri === iri) {
                                    insert = false;
                                    break;
                                }
                            }
                            if (insert) {
                                link.addTo(graph);
                                addLink(link.id, iri, domainCell, rangeCell);
                            }
                        }
                    }
                }
            }}
        />);

    }
}