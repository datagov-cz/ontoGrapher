import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/GraphElement";
import {
    Links,
    PackageRoot,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Schemes,
    VocabularyElements
} from "../config/Variables";
import {addClass, addLink, addVocabularyElement, createNewElemIRI} from "../function/FunctionCreateVars";
import {graph} from "../graph/Graph";
import {
    drawGraphElement,
    getNewLink,
    getUnderlyingFullConnections,
    highlightCell,
    restoreHiddenElem,
    setRepresentation,
    unHighlightAll,
    unHighlightCell
} from "../function/FunctionGraph";
import {HideButton} from "../graph/elementTool/ElemHide";
import {ElemCreateLink} from "../graph/elementTool/ElemCreateLink";
import {LinkInfoButton} from "../graph/linkTool/LinkInfo";
import {initLanguageObject, parsePrefix} from "../function/FunctionEditVars";
import {updateConnections, updateProjectElement, updateProjectLink} from "../interface/TransactionInterface";
import * as LocaleMain from "../locale/LocaleMain.json";
import NewLinkDiagram from "./NewLinkDiagram";
import {getLinkOrVocabElem} from "../function/FunctionGetVars";
import NewElemDiagram from "./NewElemDiagram";
import {PackageNode} from "../datatypes/PackageNode";
import {LinkType, Representation} from "../config/Enum";

interface Props {
    projectLanguage: string;
    prepareDetails: Function;
    hideDetails: Function;
    updateElementPanel: Function;
    handleChangeLoadingStatus: Function;
    error: boolean;
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
    private newLink: boolean;
    private sid: string | undefined;
    private tid: string | undefined;
    private newConceptEvent: { x: number, y: number };

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
        this.newLink = false;
        this.sid = undefined;
        this.tid = undefined;
        this.newConceptEvent = {x: 0, y: 0}
        this.createNewConcept = this.createNewConcept.bind(this);
        this.createNewLink = this.createNewLink.bind(this);
    }

    createNewConcept(name: string, language: string, pkg: PackageNode) {
        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
        let cls = new graphElement();
        cls.attr({label: {text: name}});
        let point = this.paper?.clientToLocalPoint({x: this.newConceptEvent.x, y: this.newConceptEvent.y})
        if (typeof cls.id === "string" && pkg.scheme) {
            let url = pkg.scheme.substring(0, pkg.scheme.lastIndexOf("/") + 1) + "pojem/" + name;
            let iri = createNewElemIRI(VocabularyElements, url);
            addVocabularyElement(iri, pkg.scheme, [parsePrefix("skos", "Concept")]);
            addClass(cls.id, iri, pkg);
            ProjectElements[cls.id].hidden[ProjectSettings.selectedDiagram] = false;
            if (point) {
                cls.set('position', {x: point.x, y: point.y});
                ProjectElements[cls.id].position[ProjectSettings.selectedDiagram] = {x: point.x, y: point.y};
            }
            let labels = initLanguageObject("");
            labels[language] = name;
            VocabularyElements[iri].labels = labels;
            updateProjectElement(
                ProjectSettings.contextEndpoint,
                VocabularyElements[iri].types,
                VocabularyElements[iri].labels,
                initLanguageObject(""),
                cls.id);
        }
        cls.addTo(graph);
        let bbox = this.paper?.findViewByModel(cls).getBBox();
        if (bbox) cls.resize(bbox.width, bbox.height);
        drawGraphElement(cls, language, ProjectSettings.representation);
        this.props.updateElementPanel();
        this.props.handleChangeLoadingStatus(false, "", false);
    }

    createNewLink(id: string) {
        this.newLink = true;
        this.sid = id;
        graph.getElements().forEach(element => {
            this.paper?.findViewByModel(element).highlight()
        });
    }

    saveNewLink(iri: string, sid: string, tid: string) {
        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
        let type = iri in Links ? Links[iri].type : LinkType.DEFAULT;
        let link = getNewLink(type);
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
                if (sid === tid) {
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
                if (typeof link.id === "string" && typeof sid === "string" && typeof tid === "string") {
                    if (ProjectSettings.representation === Representation.FULL || type === LinkType.GENERALIZATION) {
                        this.updateConnections(sid, tid, link.id, type, iri);
                    } else if (ProjectSettings.representation === Representation.COMPACT) {
                        let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
                        let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";
                        let property = new graphElement();
                        let source = getNewLink();
                        let target = getNewLink();
                        if (typeof source.id === "string" && typeof target.id === "string" && typeof property.id === "string") {
                            let pkg = PackageRoot.children.find(pkg => pkg.scheme &&
                                pkg.scheme === VocabularyElements[ProjectElements[sid].iri].inScheme) || PackageRoot;
                            addClass(property.id, iri, pkg);
                            addLink(source.id, mvp1IRI, property.id, sid);
                            addLink(target.id, mvp2IRI, property.id, tid);
                            ProjectElements[property.id].connections.push(source.id);
                            ProjectElements[property.id].connections.push(target.id);
                            updateProjectElement(
                                ProjectSettings.contextEndpoint,
                                [parsePrefix("z-sgov-pojem", "typ-vztahu")],
                                VocabularyElements[iri].labels,
                                VocabularyElements[iri].definitions,
                                property.id);
                            addLink(link.id, iri, sid, tid);
                            this.updateConnections(property.id, sid, source.id, type, mvp1IRI);
                            this.updateConnections(property.id, tid, target.id, type, mvp2IRI);
                        }
                    }
                    this.props.updateElementPanel();
                }
                if (type === LinkType.DEFAULT) link.appendLabel({attrs: {text: {text: getLinkOrVocabElem(iri).labels[this.props.projectLanguage]}}});
            } else link.remove();
        }
        this.sid = undefined;
        this.tid = undefined;
        this.newLink = false;
        graph.getElements().forEach(element => {
            this.paper?.findViewByModel(element).unhighlight();
        });
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

    updateElement(cell: joint.dia.Cell) {
        let id = cell.id;
        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
        cell.remove();
        ProjectElements[id].hidden[ProjectSettings.selectedDiagram] = true;
        let iri = ProjectElements[id].iri;
        if (typeof id === "string") {
            updateProjectElement(
                ProjectSettings.contextEndpoint,
                VocabularyElements[iri].types,
                VocabularyElements[iri].labels,
                VocabularyElements[iri].definitions,
                id);
        }
        this.props.handleChangeLoadingStatus(false, "", false);
        this.props.updateElementPanel();
    }

    updateConnections(sid: string, tid: string, linkID: string, type: number, iri: string) {
        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
        addLink(linkID, iri, sid, tid, type);
        ProjectElements[sid].connections.push(linkID);
        updateConnections(ProjectSettings.contextEndpoint, linkID).then(result => {
            if (result) {
                updateProjectLink(ProjectSettings.contextEndpoint, linkID).then(result => {
                    if (result) {
                        this.props.handleChangeLoadingStatus(false, "", false);
                    } else {
                        this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
                    }
                });
            } else {
                this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
            }
        });
        this.props.updateElementPanel();
    }

    deleteConnections(sid: string, id: string) {
        ProjectLinks[id].active = false;
        updateConnections(ProjectSettings.contextEndpoint, id).then(result => {
            if (result) {
                if (graph.getCell(id)) graph.getCell(id).remove();
                updateProjectLink(ProjectSettings.contextEndpoint, id).then(result => {
                    if (result) {
                        this.props.handleChangeLoadingStatus(false, "", false);
                    } else {
                        this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
                    }
                })
            } else {
                this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
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

        this.paper.on({
            'cell:pointerclick': (cellView) => {
                if (!this.newLink) {
                    let id = cellView.model.id;
                    this.props.prepareDetails(id);
                    unHighlightAll();
                    highlightCell(id);
                }
            },
            'element:pointerup': (cellView) => {
                ProjectElements[cellView.model.id].position[ProjectSettings.selectedDiagram] = cellView.model.position();
                let iri = ProjectElements[cellView.model.id].iri;
                this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
                updateProjectElement(
                    ProjectSettings.contextEndpoint,
                    VocabularyElements[iri].types,
                    VocabularyElements[iri].labels,
                    VocabularyElements[iri].definitions,
                    cellView.model.id).then(result => {
                    if (result) {
                        this.props.handleChangeLoadingStatus(false, "", false);
                    } else {
                        this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
                    }
                });
            },
            'element:pointerclick': (cellView) => {
                if (this.newLink) {
                    this.tid = cellView.model.id;
                    this.setState({modalAddLink: true});
                }
            },
            'element:mouseenter': (elementView) => {
                let id = elementView.model.id
                let tool = new HideButton({
                    useModelGeometry: false,
                    x: '100%',
                    y: '0%',
                    action: () => this.updateElement(elementView.model)
                })
                elementView.addTools(new joint.dia.ToolsView({
                    tools: [
                        !(Schemes[VocabularyElements[ProjectElements[id].iri].inScheme].readOnly) && new ElemCreateLink({
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
                let id = linkView.model.id;
                let verticesTool = new joint.linkTools.Vertices({stopPropagation: false});
                let segmentsTool = new joint.linkTools.Segments();
                let removeButton = new joint.linkTools.Remove({
                    action: ((evt, view) => {
                        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
                        if (ProjectSettings.representation === Representation.FULL) {
                            let sid = view.model.getSourceCell()?.id;
                            if (typeof sid === "string" && typeof id === "string") {
                                this.deleteConnections(sid, id);
                            }
                        } else {
                            let deleteLinks = getUnderlyingFullConnections(view.model);
                            if (deleteLinks && ProjectLinks[deleteLinks.src] && ProjectLinks[deleteLinks.tgt]) {
                                ProjectLinks[deleteLinks.src].active = false;
                                ProjectLinks[deleteLinks.tgt].active = false;
                                this.deleteConnections(ProjectLinks[deleteLinks.src].source, deleteLinks.src);
                                this.deleteConnections(ProjectLinks[deleteLinks.src].source, deleteLinks.tgt);
                            }
                            view.model.remove();
                            ProjectLinks[view.model.id].active = false;
                            this.props.handleChangeLoadingStatus(false, "", false);
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
                let readOnly = (Schemes[VocabularyElements[ProjectElements[ProjectLinks[id].source].iri].inScheme].readOnly);
                let tools = [verticesTool, segmentsTool]
                if (!readOnly) tools.push(removeButton);
                if (ProjectLinks[linkView.model.id] && ProjectLinks[linkView.model.id].type === LinkType.DEFAULT) tools.push(infoButton);
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
                if (!this.newLink && PackageRoot.children.find(pkg => pkg.scheme && !(Schemes[pkg.scheme].readOnly))) {
                    this.setState({modalAddElem: true});
                    this.newConceptEvent = {x: evt.clientX, y: evt.clientY}
                } else this.newLink = false;
            },
            'link:pointerup': (cellView) => {
                let id = cellView.model.id;
                let link = cellView.model;
                if (ProjectLinks[id].iri in Links) {
                    this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
                    ProjectLinks[link.id].vertices = link.vertices();
                    updateProjectLink(ProjectSettings.contextEndpoint, id).then(result => {
                        if (result) {
                            this.props.handleChangeLoadingStatus(false, "", false);
                        } else {
                            this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
                        }
                    });
                }
            }
        });
    }

    render() {
        return (<div
            style={{cursor: this.props.error ? "not-allowed" : "inherit", opacity: this.props.error ? "0.5" : "1"}}>
            <div
                className={"canvas"}
                id={"canvas"}
                ref={this.canvasRef}
                style={{
                    pointerEvents: this.props.error ? "none" : "auto"
                }}
                onDragOver={(event) => {
                    if (!this.props.error) event.preventDefault();
                }}
                onMouseMove={(event) => {
                    if (this.drag && !(this.props.error)) {
                        this.paper?.translate(event.nativeEvent.offsetX - this.drag.x, event.nativeEvent.offsetY - this.drag.y);
                    }
                }
                }
                onDrop={(event) => {
                    // create - get name - insert - (existing: restore)
                    this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
                    const data = JSON.parse(event.dataTransfer.getData("newClass"));
                    let cls = new graphElement({id: data.id});
                    drawGraphElement(cls, ProjectSettings.selectedLanguage, ProjectSettings.representation);
                    let point = this.paper?.clientToLocalPoint({x: event.clientX, y: event.clientY});
                    if (point) {
                        cls.set('position', {x: point.x, y: point.y});
                        ProjectElements[cls.id].position[ProjectSettings.selectedDiagram] = {x: point.x, y: point.y};
                    }
                    cls.addTo(graph);
                    let bbox = this.paper?.findViewByModel(cls).getBBox();
                    if (bbox) cls.resize(bbox.width, bbox.height);
                    ProjectElements[cls.id].hidden[ProjectSettings.selectedDiagram] = false;
                    this.props.updateElementPanel();
                    restoreHiddenElem(data.id, cls);
                    if (typeof cls.id === "string") {
                        updateProjectElement(
                            ProjectSettings.contextEndpoint,
                            VocabularyElements[ProjectElements[cls.id].iri].types,
                            VocabularyElements[ProjectElements[cls.id].iri].labels,
                            VocabularyElements[ProjectElements[cls.id].iri].definitions,
                            cls.id).then(result => {
                            if (result) {
                                this.props.handleChangeLoadingStatus(false, "", false);
                            } else {
                                this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
                            }
                        });
                    }
                    if (ProjectSettings.representation === Representation.COMPACT) setRepresentation(ProjectSettings.representation);
                }}
            />
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
            <NewElemDiagram
                projectLanguage={this.props.projectLanguage}
                modal={this.state.modalAddElem}
                close={(conceptName: string, pkg: PackageNode) => {
                    this.setState({modalAddElem: false});
                    if (conceptName && pkg) {
                        this.createNewConcept(conceptName, this.props.projectLanguage, pkg);
                    } else {
                        this.newConceptEvent = {x: 0, y: 0}
                    }
                }}/>
        </div>);

    }
}