import React from 'react';
import * as _ from "lodash";
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
import {restoreHiddenElem, setRepresentation} from "../function/FunctionGraph";
import {HideButton} from "../graph/elementTool/ElemHide";
import {ElemCreateLink} from "../graph/elementTool/ElemCreateLink";
import {parsePrefix} from "../function/FunctionEditVars";
import {
    mergeTransactions,
    updateConnections,
    updateDeleteProjectLinkVertex,
    updateProjectElement,
    updateProjectElementDiagram,
    updateProjectLink,
    updateProjectLinkVertex
} from "../interface/TransactionInterface";
import NewLinkModal from "./NewLinkModal";
import {
    getElementShape,
    getLinkOrVocabElem,
    getNewLink,
    getUnderlyingFullConnections
} from "../function/FunctionGetVars";
import NewElemModal from "./NewElemModal";
import {PackageNode} from "../datatypes/PackageNode";
import {LinkType, Representation} from "../config/Enum";
import {drawGraphElement, highlightCell, unHighlightCell, unHighlightSelected} from "../function/FunctionDraw";

interface Props {
    projectLanguage: string;
    updateElementPanel: Function;
    updateDetailPanel: Function;
    error: boolean;
    performTransaction: (transaction: { add: string[], delete: string[], update: string[] }) => void;
}

interface State {
    modalAddElem: boolean;
    modalAddLink: boolean;
}

export var paper: joint.dia.Paper;

export default class DiagramCanvas extends React.Component<Props, State> {
    private readonly canvasRef: React.RefObject<HTMLDivElement>;
    private drag: { x: any, y: any } | undefined;
    private newLink: boolean;
    private sid: string | undefined;
    private tid: string | undefined;
    private newConceptEvent: { x: number, y: number };
    private highlightedCells: string[];

    constructor(props: Props) {
        super(props);
        this.state = {
            modalAddElem: false,
            modalAddLink: false
        }
        this.canvasRef = React.createRef();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.drag = undefined;
        this.newLink = false;
        this.sid = undefined;
        this.tid = undefined;
        this.newConceptEvent = {x: 0, y: 0}
        this.highlightedCells = [];
        this.createNewConcept = this.createNewConcept.bind(this);
        this.createNewLink = this.createNewLink.bind(this);
    }

    createNewConcept(name: { [key: string]: string }, language: string, pkg: PackageNode) {
        let cls = new graphElement();
        let point = paper.clientToLocalPoint({x: this.newConceptEvent.x, y: this.newConceptEvent.y})
        if (typeof cls.id === "string") {
            let iri = createNewElemIRI(pkg.scheme, name[language]);
            addVocabularyElement(iri, pkg.scheme, [parsePrefix("skos", "Concept")]);
            addClass(cls.id, iri, pkg);
            ProjectElements[cls.id].hidden[ProjectSettings.selectedDiagram] = false;
            if (point) {
                cls.set('position', {x: point.x, y: point.y});
                ProjectElements[cls.id].position[ProjectSettings.selectedDiagram] = {x: point.x, y: point.y};
            }
            VocabularyElements[iri].labels = name;
            cls.addTo(graph);
            let bbox = paper.findViewByModel(cls).getBBox();
            if (bbox) cls.resize(bbox.width, bbox.height);
            drawGraphElement(cls, language, ProjectSettings.representation);
            this.props.updateElementPanel();
            this.props.performTransaction(mergeTransactions(updateProjectElement(
                VocabularyElements[iri], cls.id),
                updateProjectElementDiagram(cls.id, ProjectSettings.selectedDiagram,
                    ProjectElements[cls.id].position[ProjectSettings.selectedDiagram], false)));
        }
    }

    createNewLink(id: string) {
        this.newLink = true;
        this.sid = id;
        graph.getElements().forEach(element => {
            if (typeof element.id === "string") {
                highlightCell(element.id, '#ff7800');
                this.highlightedCells.push(element.id);
            }
        });
    }

    saveNewLink(iri: string, sid: string, tid: string) {
        let type = iri in Links ? Links[iri].type : LinkType.DEFAULT;
        let link = getNewLink(type);
        link.source({id: sid, connectionPoint: {name: 'boundary', args: {selector: getElementShape(sid)}}});
        link.target({id: tid, connectionPoint: {name: 'boundary', args: {selector: getElementShape(tid)}}});
        link.addTo(graph);
        if (link) {
            let s = link.getSourceElement();
            let t = link.getTargetElement();
            if (s && t) {
                let sid = s.id;
                let tid = t.id;
                if (typeof sid === "string") {
                    link.source({id: sid, connectionPoint: {name: 'boundary', args: {selector: getElementShape(sid)}}});
                }
                if (typeof tid === "string") {
                    link.target({id: tid, connectionPoint: {name: 'boundary', args: {selector: getElementShape(tid)}}});
                }
                if (sid === tid) {
                    let coords = link.getSourcePoint();
                    let bbox = paper.findViewByModel(sid).getBBox();
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
                        this.props.performTransaction(this.updateConnection(sid, tid, link.id, type, iri));
                    } else if (ProjectSettings.representation === Representation.COMPACT) {
                        let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
                        let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";
                        let find = Object.keys(ProjectElements).find(elem =>
                            ProjectElements[elem].active && ProjectElements[elem].iri === iri);
                        let property = find ? new graphElement({id: find}) : new graphElement();
                        let source = getNewLink();
                        let target = getNewLink();
                        if (typeof source.id === "string" && typeof target.id === "string" && typeof property.id === "string") {
                            let pkg = PackageRoot.children.find(pkg =>
                                pkg.scheme === VocabularyElements[ProjectElements[sid].iri].inScheme) || PackageRoot;
                            if (!find) addClass(property.id, iri, pkg);
                            addLink(source.id, mvp1IRI, property.id, sid);
                            addLink(target.id, mvp2IRI, property.id, tid);
                            ProjectElements[property.id].connections.push(source.id);
                            ProjectElements[property.id].connections.push(target.id);
                            addLink(link.id, iri, sid, tid);
                            this.props.performTransaction(
                                mergeTransactions(
                                    updateProjectElement(VocabularyElements[iri], property.id),
                                    this.updateConnection(property.id, sid, source.id, type, mvp1IRI),
                                    this.updateConnection(property.id, tid, target.id, type, mvp2IRI),
                                    this.updateConnection(sid, tid, link.id, type, iri),
                                )
                            )
                        }
                    }
                    this.props.updateElementPanel();
                    this.props.updateDetailPanel();
                }
                if (type === LinkType.DEFAULT) link.appendLabel({attrs: {text: {text: getLinkOrVocabElem(iri).labels[this.props.projectLanguage]}}});
            } else link.remove();
        }
        this.sid = undefined;
        this.tid = undefined;
        this.newLink = false;
        unHighlightSelected(this.highlightedCells);
        this.highlightedCells = [];
    }

    resizeElem(id: string) {
        let view = paper.findViewByModel(id);
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
                unHighlightCell(cell.id)
                highlightCell(cell.id);
            }
            for (let link of links) {
                if (link.getSourceCell() === null) {
                    link.source({id: id, connectionPoint: {name: 'boundary', args: {selector: getElementShape(id)}}});
                } else {
                    link.target({id: id, connectionPoint: {name: 'boundary', args: {selector: getElementShape(id)}}});
                }
            }
        }
    }

    updateElement(cell: joint.dia.Cell) {
        let id = cell.id;
        cell.remove();
        ProjectElements[id].hidden[ProjectSettings.selectedDiagram] = true;
        this.props.updateElementPanel();
        this.props.updateDetailPanel();
        if (typeof id === "string") {
            this.props.performTransaction(updateProjectElementDiagram(id, ProjectSettings.selectedDiagram,
                ProjectElements[id].position[ProjectSettings.selectedDiagram], false))
        }
    }

    updateConnection(sid: string, tid: string, linkID: string, type: number, iri: string) {
        addLink(linkID, iri, sid, tid, type);
        ProjectElements[sid].connections.push(linkID);
        this.props.updateElementPanel();
        return mergeTransactions(updateConnections(linkID), updateProjectLink(linkID));
    }

    deleteConnections(sid: string, id: string) {
        ProjectLinks[id].active = false;
        if (graph.getCell(id)) graph.getCell(id).remove();
        return mergeTransactions(updateProjectLink(id));
    }

    updateVertices(id: string, linkVerts: joint.dia.Link.Vertex[]) {
        if (!ProjectLinks[id].vertices[ProjectSettings.selectedDiagram]) ProjectLinks[id].vertices[ProjectSettings.selectedDiagram] = [];
        let oldVerts = _.cloneDeep(ProjectLinks[id].vertices[ProjectSettings.selectedDiagram]);
        let update = [];
        let del = -1;
        for (let i = 0; i < Math.max(linkVerts.length, ProjectLinks[id].vertices[ProjectSettings.selectedDiagram].length); i++) {
            if (ProjectLinks[id].vertices[ProjectSettings.selectedDiagram][i] && !(linkVerts[i])) {
                del = i;
                break;
            } else {
                ProjectLinks[id].vertices[ProjectSettings.selectedDiagram][i] = {x: linkVerts[i].x, y: linkVerts[i].y};
                update.push(i);
            }
        }
        let transactions = updateProjectLinkVertex(id, update, oldVerts);
        if (del !== -1) transactions = mergeTransactions(transactions,
            updateDeleteProjectLinkVertex(id, del, ProjectLinks[id].vertices[ProjectSettings.selectedDiagram].length))
        ProjectLinks[id].vertices[ProjectSettings.selectedDiagram] = linkVerts;
        return transactions;
    }

    addLinkTools(linkView: joint.dia.LinkView) {
        let id = linkView.model.id;
        let verticesTool = new joint.linkTools.Vertices({stopPropagation: false});
        let segmentsTool = new joint.linkTools.Segments({stopPropagation: false});
        let removeButton = new joint.linkTools.Remove({
            distance: 5,
            action: ((evt, view) => {
                if (ProjectSettings.representation === Representation.FULL) {
                    let sid = view.model.getSourceCell()?.id;
                    if (typeof sid === "string" && typeof id === "string") {
                        let transactions = this.deleteConnections(sid, id);
                        let compactConn = Object.keys(ProjectLinks).find(link => ProjectLinks[link].active &&
                            ProjectLinks[link].iri === ProjectElements[ProjectLinks[id].source].iri &&
                            ProjectLinks[link].target === ProjectLinks[id].target);
                        if (compactConn) {
                            transactions = mergeTransactions(transactions, this.deleteConnections(ProjectLinks[compactConn].source, compactConn));
                        }
                        this.props.performTransaction(transactions);
                    }
                } else {
                    let deleteLinks = getUnderlyingFullConnections(view.model);
                    let transactions: { add: string[], delete: string[], update: string[] } = {
                        add: [],
                        delete: [],
                        update: []
                    };
                    if (deleteLinks && ProjectLinks[deleteLinks.src] && ProjectLinks[deleteLinks.tgt]) {
                        ProjectLinks[deleteLinks.src].active = false;
                        ProjectLinks[deleteLinks.tgt].active = false;
                        transactions = mergeTransactions(transactions,
                            this.deleteConnections(ProjectLinks[deleteLinks.src].source, deleteLinks.src),
                            this.deleteConnections(ProjectLinks[deleteLinks.src].source, deleteLinks.tgt));
                    }
                    let sid = view.model.getSourceCell()?.id;
                    if (typeof sid === "string" && typeof id === "string") {
                        transactions = mergeTransactions(transactions, this.deleteConnections(sid, id));
                    }
                    view.model.remove();
                    ProjectLinks[view.model.id].active = false;
                    this.props.updateElementPanel();
                    ProjectSettings.selectedLink = "";
                    this.props.performTransaction(transactions);
                }
            })
        })
        let readOnly = (Schemes[VocabularyElements[ProjectElements[ProjectLinks[id].source].iri].inScheme].readOnly);
        let tools = [verticesTool, segmentsTool]
        if (!readOnly) tools.push(removeButton);
        let toolsView = new joint.dia.ToolsView({
            tools: tools
        });
        linkView.addTools(toolsView);
    }

    getElementToolPosition(id: string | number, topRight: boolean = false): { x: number | string, y: number | string } {
        switch (getElementShape(id)) {
            case "bodyEllipse":
                return topRight ? {x: '85%', y: '15%'} : {x: '15%', y: '15%'};
            case "bodyTrapezoid":
                return topRight ? {x: '100%', y: 0} : {x: 20, y: 0};
            case "bodyDiamond":
                return topRight ? {x: '75%', y: '25%'} : {x: '25%', y: '25%'};
            case "bodyBox":
                return topRight ? {x: '100%', y: 0} : {x: 0, y: 0};
            default:
                return topRight ? {x: '100%', y: 0} : {x: 0, y: 0};
        }
    }

    componentDidMount(): void {
        const node = (this.canvasRef.current! as HTMLElement);

        paper = new joint.dia.Paper({
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
            defaultConnectionPoint: {name: 'boundary', args: {sticky: true, selector: 'bodyBox'}},
            defaultLink: function () {
                return getNewLink();
            }
        });

        paper.on({
            'cell:pointerclick': (cellView) => {
                if (!this.newLink) {
                    let id = cellView.model.id;
                    this.props.updateDetailPanel(id);
                    unHighlightSelected(this.highlightedCells);
                    highlightCell(id);
                    this.highlightedCells = [id];
                }
            },
            'element:pointerup': (cellView) => {
                if (!this.newLink) {
                    let pos = cellView.model.position();
                    let id = cellView.model.id;
                    if (pos.x !== ProjectElements[id].position[ProjectSettings.selectedDiagram].x ||
                        pos.y !== ProjectElements[cellView.model.id].position[ProjectSettings.selectedDiagram].y) {
                        let oldPos = _.cloneDeep(ProjectElements[id].position[ProjectSettings.selectedDiagram]);
                        ProjectElements[id].position[ProjectSettings.selectedDiagram] = pos;
                        this.props.performTransaction(
                            updateProjectElementDiagram(cellView.model.id, ProjectSettings.selectedDiagram, oldPos, false));
                    }
                }
            },
            'element:pointerclick': (cellView) => {
                ProjectSettings.selectedLink = "";
                if (this.newLink) {
                    this.tid = cellView.model.id;
                    this.setState({modalAddLink: true});
                }
            },
            'element:mouseenter': (elementView) => {
                let id = elementView.model.id;
                let tool = new HideButton({
                    useModelGeometry: false,
                    ...this.getElementToolPosition(id, true),
                    offset: {x: getElementShape(id) === "bodyTrapezoid" ? -20 : 0, y: 0},
                    action: () => this.updateElement(elementView.model)
                })
                elementView.addTools(new joint.dia.ToolsView({
                    tools: [
                        !(Schemes[VocabularyElements[ProjectElements[id].iri].inScheme].readOnly) && new ElemCreateLink({
                            useModelGeometry: false,
                            ...this.getElementToolPosition(id),
                            action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                                if (graph.getElements().length > 1) this.createNewLink(evt.currentTarget.getAttribute("model-id"));
                            }
                        }),
                        tool]
                }));
            },
            'link:mouseenter': (linkView) => {
                if (ProjectSettings.selectedLink === linkView.model.id) this.addLinkTools(linkView);
            },
            'cell:mouseleave': function (cellView) {
                cellView.removeTools();
            },
            'blank:pointerdown': (evt, x, y) => {
                ProjectSettings.selectedLink = "";
                this.props.updateDetailPanel();
                unHighlightSelected(this.highlightedCells);
                this.highlightedCells = [];
                this.drag = {x: x, y: y};
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
                if (!this.newLink && PackageRoot.children.find(pkg => !(Schemes[pkg.scheme].readOnly))) {
                    this.setState({modalAddElem: true});
                    this.newConceptEvent = {x: evt.clientX, y: evt.clientY}
                } else this.newLink = false;
                this.props.updateDetailPanel();
                unHighlightSelected(this.highlightedCells);
                this.highlightedCells = [];
                ProjectSettings.selectedLink = "";
            },
            'link:pointerclick': (linkView) => {
                ProjectSettings.selectedLink = linkView.model.id;
                this.addLinkTools(linkView);
            },
            'link:pointerup': (cellView) => {
                let id = cellView.model.id;
                let link = cellView.model;
                link.findView(paper).removeRedundantLinearVertices();
                this.props.performTransaction(this.updateVertices(id, link.vertices()));
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
                        paper.translate(event.nativeEvent.offsetX - this.drag.x, event.nativeEvent.offsetY - this.drag.y);
                    }
                }
                }
                onDrop={(event) => {
                    let transactions: { add: string[], delete: string[], update: string[] } = {
                        add: [],
                        delete: [],
                        update: []
                    }
                    const data = JSON.parse(event.dataTransfer.getData("newClass"));
                    let matrixDimension = Math.ceil(Math.sqrt(data.id.length));
                    let map: { add: string[], delete: string[], update: string[] }[] = [];
                    data.id.forEach((id: string, i: number) => {
                        let cls = new graphElement({id: id});
                        drawGraphElement(cls, ProjectSettings.selectedLanguage, ProjectSettings.representation);
                        let point = paper.clientToLocalPoint({x: event.clientX, y: event.clientY});
                        if (data.id.length > 1) {
                            let x = i % matrixDimension;
                            let y = Math.floor(i / matrixDimension);
                            cls.set('position', {x: (point.x + (x * 200)), y: (point.y + (y * 200))});
                            ProjectElements[id].position[ProjectSettings.selectedDiagram] = {
                                x: (point.x + (x * 200)),
                                y: (point.y + (y * 200))
                            };
                        } else {
                            cls.set('position', {x: point.x, y: point.y});
                            ProjectElements[id].position[ProjectSettings.selectedDiagram] = {
                                x: point.x,
                                y: point.y
                            };
                        }
                        map.push(updateProjectElementDiagram(id, ProjectSettings.selectedDiagram,
                            ProjectElements[id].position[ProjectSettings.selectedDiagram], true));
                        cls.addTo(graph);
                        ProjectElements[id].hidden[ProjectSettings.selectedDiagram] = false;
                        this.props.updateElementPanel();
                        transactions = mergeTransactions(transactions, restoreHiddenElem(id, cls, true, true, true));
                        map.push(updateProjectElement(
                            VocabularyElements[ProjectElements[id].iri], id));
                    });
                    this.props.performTransaction(mergeTransactions(...map, transactions));
                    if (ProjectSettings.representation === Representation.COMPACT) setRepresentation(ProjectSettings.representation);
                }}
            />
            <NewLinkModal
                projectLanguage={this.props.projectLanguage}
                modal={this.state.modalAddLink}
                sid={this.sid}
                tid={this.tid}
                close={(selectedLink: string) => {
                    this.setState({modalAddLink: false});
                    if (selectedLink && this.sid && this.tid) this.saveNewLink(selectedLink, this.sid, this.tid);
                    else {
                        this.newLink = false;
                        unHighlightSelected(this.highlightedCells);
                        this.highlightedCells = [];
                    }
                }}/>
            <NewElemModal
                projectLanguage={this.props.projectLanguage}
                modal={this.state.modalAddElem}
                close={(conceptName: { [key: string]: string }, pkg: PackageNode) => {
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