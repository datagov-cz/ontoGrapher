import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/GraphElement";
import {Links, ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {addClass, addLink, addVocabularyElement, createNewElemIRI} from "../function/FunctionCreateVars";
import {graph} from "../graph/Graph";
import {
    getNewLabel,
    getNewLink,
    highlightCell,
    nameGraphElement,
    restoreHiddenElem,
    unHighlightAll,
    unHighlightCell
} from "../function/FunctionGraph";
import {HideButton} from "../graph/elementTool/ElemHide";
import {ElemCreateLink} from "../graph/elementTool/ElemCreateLink";
import {LinkInfoButton} from "../graph/linkTool/LinkInfo";
import {initLanguageObject} from "../function/FunctionEditVars";
import {
    updateConnections,
    updateDeleteProjectElement,
    updateProjectElement,
    updateProjectLink
} from "../interface/TransactionInterface";
import * as LocaleMain from "../locale/LocaleMain.json";
import NewLinkDiagram from "./NewLinkDiagram";

interface Props {
    projectLanguage: string;
    selectedLink: string;
    prepareDetails: Function;
    hideDetails: Function;
    updateElementPanel: Function;
    handleChangeLoadingStatus: Function;
    retry: boolean;
}

interface State {
    modalAddElem: boolean;
    modalAddLink: boolean;
}

export default class DiagramCanvas extends React.Component<Props, State> {
    private readonly canvasRef: React.RefObject<HTMLDivElement>;
    private paper: joint.dia.Paper | undefined;
    private magnet: boolean;
    private drag: { x: any, y: any } | undefined;
    private lastUpdate: { sid?: string, tid?: string, id?: string, type?: string, iri?: string }
    private newLink: boolean;
    private sid: string | undefined;
    private tid: string | undefined;

    constructor(props: Props) {
        super(props);
        this.state = {
            modalAddElem: false,
            modalAddLink: false
        }
        this.canvasRef = React.createRef();
        this.magnet = false;
        this.componentDidMount = this.componentDidMount.bind(this);
        this.drag = undefined;
        this.lastUpdate = {};
        this.newLink = false;
        this.sid = undefined;
        this.tid = undefined;
        this.createNewConcept = this.createNewConcept.bind(this);
        this.createNewLink = this.createNewLink.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        if (prevProps !== this.props && (this.props.retry && ProjectSettings.lastSource === DiagramCanvas.name)) {
            if (this.lastUpdate.sid && this.lastUpdate.tid && this.lastUpdate.id && this.lastUpdate.type && this.lastUpdate.iri) {
                this.updateConnections(this.lastUpdate.sid, this.lastUpdate.tid, this.lastUpdate.id, this.lastUpdate.type, this.lastUpdate.iri);
            } else if (this.lastUpdate.sid && this.lastUpdate.id && (!this.lastUpdate.tid)) {
                this.deleteConnections(this.lastUpdate.sid, this.lastUpdate.id);
            }
        }
    }

    createNewConcept(event: { clientX: any; clientY: any; }) {
        let cls = new graphElement();
        let label = "<blank>";
        cls.attr({label: {text: label}});
        if (typeof cls.id === "string") {
            let iri = createNewElemIRI(initLanguageObject(""), VocabularyElements);
            addVocabularyElement(cls.id, iri);
            addClass(cls.id, iri, ProjectSettings.selectedPackage, true, true);
            updateProjectElement(
                ProjectSettings.contextEndpoint,
                DiagramCanvas.name,
                [],
                initLanguageObject(""),
                initLanguageObject(""),
                [],
                [],
                cls.id);
        }
        cls.set('position', this.paper?.clientToLocalPoint({x: event.clientX, y: event.clientY}));
        cls.addTo(graph);
        let bbox = this.paper?.findViewByModel(cls).getBBox();
        if (bbox) cls.resize(bbox.width, bbox.height);
        ProjectElements[cls.id].hidden[ProjectSettings.selectedDiagram] = false;
        ProjectElements[cls.id].position[ProjectSettings.selectedDiagram] = cls.position();
        this.paper?.update();
        this.props.updateElementPanel();
    }

    createNewLink(id: string) {
        this.newLink = true;
        this.sid = id;
        graph.getElements().forEach(element => {
            this.paper?.findViewByModel(element).highlight()
        });
    }

    saveNewLink(iri: string, sid: string, tid: string) {
        let link = getNewLink(Links[iri].type);
        link.source({id: sid});
        link.target({id: tid});
        link.addTo(graph);
        if (link) {
            let s = link.getSourceElement();
            let t = link.getTargetElement();
            if (s && t) {
                let sid = s.id;
                let tid = t.id;
                link.source({id: sid});
                link.target({id: tid});
                if (sid === tid && (!graph.getConnectedLinks(s).find(link => ProjectLinks[link.id].iri === ProjectSettings.selectedLink))) {
                    let coords = link.getSourcePoint();
                    let bbox = this.paper?.findViewByModel(sid).getBBox();
                    if (bbox) {
                        link.vertices([
                            new joint.g.Point(coords.x, coords.y + 100),
                            new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y + 100),
                            new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y),
                        ])
                    }
                }
                let type: string = Links[iri].type;
                if (typeof link.id === "string" && typeof sid === "string" && typeof tid === "string") {
                    this.updateConnections(sid, tid, link.id, type, iri);
                }
                if (type === "default") link.appendLabel({attrs: {text: {text: Links[iri].labels[this.props.projectLanguage]}}});
            } else link.remove();
        }
        this.sid = undefined;
        this.tid = undefined;
        this.newLink = false;
        graph.getElements().forEach(element => {
            this.paper?.findViewByModel(element).unhighlight();
        });
        this.paper?.update()
    }

    resizeElem(id: string) {
        let view = this.paper?.findViewByModel(id);
        if (view) {
            let bbox = view.getBBox();
            let cell = graph.getCell(id);
            let links = graph.getConnectedLinks(cell);
            for (let link of links) {
                if (link.getSourceCell()?.id === id) {
                    link.source({x: bbox.x, y: bbox.y});
                } else {
                    link.target({x: bbox.x, y: bbox.y});
                }
            }
            if (typeof cell.id === "string") {
                unHighlightCell(cell.id);
            }
            if (typeof cell.id === "string") {
                highlightCell(cell.id);
            }
            for (let link of links) {
                if (link.getSourceCell() === null) {
                    link.source({id: id});
                } else {
                    link.target({id: id});
                }
            }
        }
    }

    updateConnections(sid: string, tid: string, linkID: string, type: string, iri: string) {
        this.lastUpdate = {sid: sid, tid: tid, id: linkID, type: type, iri: iri};
        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
        addLink(linkID, iri, sid, tid, type);
        ProjectElements[sid].connections.push(linkID);
        updateConnections(ProjectSettings.contextEndpoint, linkID, [], DiagramCanvas.name).then(result => {
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
        updateConnections(ProjectSettings.contextEndpoint, id, [id], DiagramCanvas.name).then(result => {
            if (result) {
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
            defaultLink: function () {
                return getNewLink();
            }
        });

        let RemoveButton = joint.elementTools.Remove.extend({
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
                action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                    let id = evt.currentTarget.getAttribute("model-id");
                    let links = graph.getConnectedLinks(graph.getCell(id));
                    for (let link of links) {
                        delete ProjectLinks[link.id];
                    }
                    graph.getCell(id).remove();

                }
            }
        });

        this.paper.on({
            'cell:pointerclick': (cellView) => {
                if (!this.newLink) {
                    let id = cellView.model.id;
                    this.props.prepareDetails(id);
                    unHighlightAll();
                    highlightCell(id);
                }
            },
            'element:pointerclick': (cellView) => {
                if (this.newLink) {
                    this.tid = cellView.model.id;
                    this.setState({modalAddLink: true});
                }
            },
            'element:mouseenter': (elementView) => {
                let tool = ProjectElements[elementView.model.id].active ? new HideButton({
                    useModelGeometry: false,
                    x: '100%',
                    y: '0%',
                    action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                        let id = evt.currentTarget.getAttribute("model-id");
                        for (let cell of graph.getElements()) {
                            if (cell.id === id) {
                                for (let link of graph.getConnectedLinks(cell)) {
                                    ProjectLinks[link.id].vertices = link.vertices();
                                }
                                ProjectElements[id].position[ProjectSettings.selectedDiagram] = cell.position();
                                cell.remove();
                                ProjectElements[id].hidden[ProjectSettings.selectedDiagram] = true;
                                let iri = ProjectElements[id].iri;
                                updateProjectElement(
                                    ProjectSettings.contextEndpoint,
                                    DiagramCanvas.name,
                                    VocabularyElements[iri].types,
                                    VocabularyElements[iri].labels,
                                    VocabularyElements[iri].definitions,
                                    ProjectElements[id].attributes,
                                    ProjectElements[id].properties,
                                    id);
                                break;
                            }
                        }
                        this.props.updateElementPanel();
                    }
                }) : new RemoveButton({
                    useModelGeometry: false,
                    x: '100%',
                    y: '0%',
                    action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                        let id = evt.currentTarget.getAttribute("model-id");
                        for (let cell of graph.getElements()) {
                            if (cell.id === id) {
                                ProjectElements[id].diagrams.splice(ProjectElements[id].diagrams.indexOf(ProjectSettings.selectedDiagram), 1)
                                ProjectElements[id].position[ProjectSettings.selectedDiagram] = cell.position();
                                cell.remove();
                                ProjectElements[id].hidden[ProjectSettings.selectedDiagram] = true;
                                let iri = ProjectElements[id].iri;
                                updateProjectElement(
                                    ProjectSettings.contextEndpoint,
                                    DiagramCanvas.name,
                                    VocabularyElements[iri].types,
                                    VocabularyElements[iri].labels,
                                    VocabularyElements[iri].definitions,
                                    ProjectElements[id].attributes,
                                    ProjectElements[id].properties,
                                    id);
                                break;
                            }
                        }
                        this.props.updateElementPanel();
                    }
                });
                elementView.addTools(new joint.dia.ToolsView({
                    tools: [
                        new ElemCreateLink({
                            useModelGeometry: false,
                            y: '0%',
                            x: '0%',
                            action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                                if (graph.getElements().length > 1) this.createNewLink(evt.currentTarget.getAttribute("model-id"));
                            }
                        }),
                        tool]
                }));
            },
            'link:mouseenter': (linkView) => {
                let verticesTool = new joint.linkTools.Vertices();
                let segmentsTool = new joint.linkTools.Segments();
                let removeButton = new joint.linkTools.Remove({
                    action: ((evt, view) => {
                        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
                        let id = view.model.id;
                        let sid = view.model.getSourceCell()?.id;
                        if (typeof sid === "string" && typeof id === "string") {
                            this.deleteConnections(sid, id);
                        }
                    })
                })
                let infoButton = new LinkInfoButton({
                    action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                        let id = evt.currentTarget.getAttribute("model-id");
                        this.props.prepareDetails(id);
                        unHighlightAll();
                        highlightCell(id);
                    }
                })
                let tools = [verticesTool, segmentsTool, removeButton]
                if (ProjectLinks[linkView.model.id] && ProjectLinks[linkView.model.id].type === "default") tools.push(infoButton);
                let toolsView = new joint.dia.ToolsView({
                    tools: tools
                });
                linkView.addTools(toolsView);
            },
            'cell:mouseleave': function (cellView) {
                cellView.removeTools();
            },
            'blank:pointerdown': (evt, x, y) => {
                this.props.hideDetails();
                unHighlightAll();
                this.drag = {x: x, y: y};
                graph.getElements().forEach(element => {
                    this.paper?.findViewByModel(element).unhighlight()
                });
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
            'blank:pointerclick': (evt) => {
                if (!this.newLink) this.createNewConcept(evt);
                else this.newLink = false;
            }
            // 'link:pointerup': (linkView) => {
            //     let id = linkView.model.id;
            //     let link = graph.getLinks().find(link => link.id === id);
            //     if (link) {
            //         let s = link.getSourceElement();
            //         let t = link.getTargetElement();
            //         if (s && t) {
            //             let sid = s.id;
            //             let tid = t.id;
            //             link.source({id: sid});
            //             link.target({id: tid});
            //             if (sid === tid && (!graph.getConnectedLinks(s).find(link => ProjectLinks[link.id].iri === ProjectSettings.selectedLink))) {
            //                 let coords = link.getSourcePoint();
            //                 let bbox = this.paper?.findViewByModel(sid).getBBox();
            //                 if (bbox) {
            //                     link.vertices([
            //                         new joint.g.Point(coords.x, coords.y + 100),
            //                         new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y + 100),
            //                         new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y),
            //                     ])
            //                 }
            //             }
            //             let type: string = Links[ProjectSettings.selectedLink].type in LinkConfig ? Links[ProjectSettings.selectedLink].type : "default";
            //             if (typeof link.id === "string" && typeof sid === "string" && typeof tid === "string") {
            //                 this.updateConnections(sid, tid, link.id, type);
            //             }
            //             if (type === "default") link.appendLabel({attrs: {text: {text: Links[this.props.selectedLink].labels[this.props.projectLanguage]}}});
            //         } else link.remove();
            //     }
            // },
        });
    }

    render() {
        return (<div>
            <div
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
                    cls.attr({label: {text: label}});
                    if (data.type === "new") {
                        if (typeof cls.id === "string") {
                        let iri = createNewElemIRI(initLanguageObject(""), VocabularyElements);
                        addVocabularyElement(cls.id, iri, data.iri);
                        addClass(cls.id, iri, ProjectSettings.selectedPackage, true, true);
                        updateProjectElement(
                            ProjectSettings.contextEndpoint,
                            DiagramCanvas.name,
                            [data.iri],
                            initLanguageObject(""),
                            initLanguageObject(""),
                            [],
                            [],
                            cls.id);
                    }
                } else if (data.type === "existing") {
                    cls = new graphElement({id: data.id});
                    nameGraphElement(cls, ProjectSettings.selectedLanguage);
                }
                cls.set('position', this.paper?.clientToLocalPoint({x: event.clientX, y: event.clientY}));
                cls.addTo(graph);
                let bbox = this.paper?.findViewByModel(cls).getBBox();
                if (bbox) cls.resize(bbox.width, bbox.height);
                ProjectElements[cls.id].hidden[ProjectSettings.selectedDiagram] = false;
                ProjectElements[cls.id].position[ProjectSettings.selectedDiagram] = cls.position();
                this.props.updateElementPanel();
                if (data.type === "existing") {
                    restoreHiddenElem(data.id, cls);
                    if (typeof cls.id === "string") {
                        updateProjectElement(
                            ProjectSettings.contextEndpoint,
                            DiagramCanvas.name,
                            VocabularyElements[ProjectElements[cls.id].iri].types,
                            VocabularyElements[ProjectElements[cls.id].iri].labels,
                            VocabularyElements[ProjectElements[cls.id].iri].definitions,
                            ProjectElements[cls.id].attributes,
                            ProjectElements[cls.id].properties,
                            cls.id);
                    }
                }
                }}
            />
            {/*<NewElemDiagram/>*/}
            <NewLinkDiagram
                projectLanguage={this.props.projectLanguage}
                modal={this.state.modalAddLink}
                sid={this.sid}
                tid={this.tid}
                close={(selectedLink: string) => {
                    this.setState({modalAddLink: false});
                    if (selectedLink && this.sid && this.tid) this.saveNewLink(selectedLink, this.sid, this.tid);
                    else {
                        this.newLink = false;
                        graph.getElements().forEach(element => {
                            this.paper?.findViewByModel(element).unhighlight()
                        });
                    }
                }}/>
        </div>);

    }
}