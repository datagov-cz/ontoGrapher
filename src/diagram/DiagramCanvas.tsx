// @ts-nocheck
import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/graphElement";
import {Links, ProjectElements, ProjectLinks, ProjectSettings, Schemes, VocabularyElements} from "../config/Variables";
import {addClass, addLink, addVocabularyElement, createNewElemIRI} from "../function/FunctionCreateVars";
import {graph} from "../graph/graph";
import {
    getNewLabel,
    highlightCell,
    nameGraphElement,
    restoreDomainOfConnections,
    restoreHiddenElem,
    unHighlightAll,
    unHighlightCell
} from "../function/FunctionGraph";
import {HideButton} from "../graph/elemHide";
import {ElemInfoButton} from "../graph/elemInfo";
import {LinkInfoButton} from "../graph/linkInfo";
import {initLanguageObject} from "../function/FunctionEditVars";
import {
    updateConnections,
    updateDeleteProjectElement,
    updateProjectElement,
    updateProjectLink
} from "../interface/TransactionInterface";
import * as LocaleMain from "../locale/LocaleMain.json";

interface DiagramCanvasProps {
    projectLanguage: string;
    selectedLink: string;
    prepareDetails: Function;
    hideDetails: Function;
    updateElementPanel: Function;
    handleChangeLoadingStatus: Function;
    retry: boolean;
}

export default class DiagramCanvas extends React.Component<DiagramCanvasProps> {
    private readonly canvasRef: React.RefObject<HTMLDivElement>;
    private paper: joint.dia.Paper | undefined;
    private magnet: boolean;
    private drag: { x: any, y: any } | undefined;
    private lastUpdate: { sid?: string, tid?: string, id?: string }

    constructor(props: DiagramCanvasProps) {
        super(props);
        this.canvasRef = React.createRef();
        this.magnet = false;
        this.componentDidMount = this.componentDidMount.bind(this);
        this.drag = undefined;
        this.lastUpdate = {};
    }

    componentDidUpdate(prevProps: Readonly<DiagramCanvasProps>, prevState: Readonly<{}>, snapshot?: any) {
        if (prevProps !== this.props && (this.props.retry && ProjectSettings.lastSource === DiagramCanvas.name)) {
            if (this.lastUpdate.sid && this.lastUpdate.tid && this.lastUpdate.linkID) {
                this.updateConnections(this.lastUpdate.sid, this.lastUpdate.tid, this.lastUpdate.id);
            } else if (this.lastUpdate.sid && this.lastUpdate.id && (!this.lastUpdate.tid)) {
                this.deleteConnections(this.lastUpdate.sid, this.lastUpdate.id);
            }
        }
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

    updateConnections(sid: string, tid: string, linkID: string) {
        this.lastUpdate = {sid: sid, tid: tid, id: linkID};
        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
        addLink(linkID, this.props.selectedLink, sid, tid);
        ProjectElements[sid].connections.push(linkID);
        updateConnections(ProjectSettings.contextEndpoint, sid, [], DiagramCanvas.name).then(result => {
            if (result) {
                updateProjectLink(ProjectSettings.contextEndpoint, linkID, DiagramCanvas.name).then(result => {
                    if (result) {
                        this.props.handleChangeLoadingStatus(false, "", false);
                    } else {
                        this.props.handleChangeLoadingStatus(false, "", true);
                    }
                });
            } else {
                this.props.handleChangeLoadingStatus(false, "", true);
            }
        });
    }

    deleteConnections(sid: string, id: string) {
        this.lastUpdate = {sid: sid, id: id, tid: undefined};
        if (ProjectElements[sid].connections.includes(id)) ProjectElements[sid].connections.splice(ProjectElements[sid].connections.indexOf(id), 1);
        updateConnections(ProjectSettings.contextEndpoint, sid, [id], DiagramCanvas.name).then(result => {
            if (result) {
                let vocabElem = VocabularyElements[ProjectLinks[id].iri];
                if (vocabElem && vocabElem.domain) {
                    let domainOf = VocabularyElements[vocabElem.domain].domainOf;
                    if (domainOf && (Schemes[VocabularyElements[vocabElem.domain].inScheme].readOnly)) {
                        domainOf.splice(domainOf.indexOf(ProjectLinks[id].iri), 1);
                    }
                }
                delete ProjectLinks[id];
                graph.getCell(id).remove();
                updateDeleteProjectElement(ProjectSettings.contextEndpoint, ProjectSettings.ontographerContext + "-" + id, DiagramCanvas.name).then(result => {
                    if (result) {
                        this.props.handleChangeLoadingStatus(false, "", false);
                    } else {
                        this.props.handleChangeLoadingStatus(false, "", true);
                    }
                })
            } else {
                this.props.handleChangeLoadingStatus(false, "", true);
            }
        });
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
            'link:mouseenter': (linkView) => {
                let verticesTool = new joint.linkTools.Vertices();
                let segmentsTool = new joint.linkTools.Segments();
                let removeButton = new joint.linkTools.Remove({
                    action: ((evt: any, view: { model: { id: any; getSourceCell: () => { (): any; new(): any; id: any; }; remove: () => void; }; }) => {
                        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
                        let id = view.model.id;
                        let sid = view.model.getSourceCell().id;
                        this.deleteConnections(sid, id);
                    })
                })
                let toolsView = new joint.dia.ToolsView({
                    tools: [verticesTool, segmentsTool, removeButton,
                        new LinkInfoButton({
                            action: (evt) => {
                                let id = evt.currentTarget.getAttribute("model-id");
                                this.props.prepareDetails(id);
                                unHighlightAll();
                                highlightCell(id);
                            }
                        })
                    ]
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
                const data = evt.data;
                const cell = data.cell;
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
                                this.updateConnections(sid, tid, link.id);
                            }
                            link.appendLabel({attrs: {text: {text: Links[this.props.selectedLink].labels[this.props.projectLanguage]}}});
                        }
                        break;
                    }
                }
            },
        });

        joint.elementTools.RemoveButton = joint.elementTools.Remove.extend({
            options: {
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
                    for (let link of links) {
                        delete ProjectLinks[link.id];
                    }
                    graph.getCell(id).remove();

                }
            }
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
                    if (typeof cls.id === "string") {
                        let iri = createNewElemIRI(initLanguageObject(""), VocabularyElements);
                        addVocabularyElement(cls.id, iri, data.iri);
                        addClass(cls.id, iri, ProjectSettings.selectedPackage, true, true);
                        updateProjectElement(
                            ProjectSettings.contextEndpoint,
                            DiagramCanvas,
                            [data.iri],
                            initLanguageObject(""),
                            initLanguageObject(""),
                            [],
                            [],
                            cls.id);
                    }
                } else if (data.type === "existing") {
                    cls = new graphElement({id: data.id});
                    label = nameGraphElement(cls, ProjectSettings.selectedLanguage);
                }
                cls.set('position', this.paper?.clientToLocalPoint({x: event.clientX, y: event.clientY}));
                cls.attr({label: {text: label}});
                cls.addTo(graph);
                let bbox = this.paper?.findViewByModel(cls).getBBox();
                cls.resize(bbox.width, bbox.height);
                ProjectElements[cls.id].hidden[ProjectSettings.selectedDiagram] = false;
                ProjectElements[cls.id].position[ProjectSettings.selectedDiagram] = cls.position();
                this.props.updateElementPanel();
                if (data.type === "existing") {
                    restoreHiddenElem(data.id, cls);
                    restoreDomainOfConnections();
                    updateProjectElement(
                        ProjectSettings.contextEndpoint,
                        DiagramCanvas,
                        VocabularyElements[ProjectElements[cls.id].iri].types,
                        VocabularyElements[ProjectElements[cls.id].iri].labels,
                        VocabularyElements[ProjectElements[cls.id].iri].definitions,
                        ProjectElements[cls.id].attributes,
                        ProjectElements[cls.id].properties,
                        cls.id);
                }
            }}
        />);

    }
}