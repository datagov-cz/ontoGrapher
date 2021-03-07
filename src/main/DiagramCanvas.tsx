import React from 'react';
import * as joint from 'jointjs';
import {graphElement} from "../graph/GraphElement";
import {
    Diagrams,
    PackageRoot,
    ProjectElements,
    ProjectSettings,
    Schemes,
    VocabularyElements
} from "../config/Variables";
import {graph} from "../graph/Graph";
import {restoreHiddenElem, setRepresentation} from "../function/FunctionGraph";
import {HideButton} from "../graph/elementTool/ElemHide";
import {ElemCreateLink} from "../graph/elementTool/ElemCreateLink";
import NewLinkModal from "./NewLinkModal";
import {getElementShape, getNewLink} from "../function/FunctionGetVars";
import NewElemModal from "./NewElemModal";
import {PackageNode} from "../datatypes/PackageNode";
import {Representation} from "../config/Enum";
import {drawGraphElement, highlightCell} from "../function/FunctionDraw";
import {
    highlightElement,
    resetDiagramSelection,
    unhighlightElement,
    updateDiagramPosition,
    zoomDiagram
} from "../function/FunctionDiagram";
import {updateProjectElement, updateProjectElementDiagram} from "../queries/UpdateElementQueries";
import {
    createNewConcept,
    getElementToolPosition,
    isElementPositionOutdated,
    moveElements
} from "../function/FunctionElem";
import {addLinkTools, saveNewLink, updateVertices} from "../function/FunctionLink";
import {ElementColors} from "../config/visual/ElementColors";

interface Props {
    projectLanguage: string;
    updateElementPanel: (id?: string) => void;
    updateDetailPanel: (id?: string) => void;
    error: boolean;
    performTransaction: (...queries: string[]) => void;
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
    private drawStart: joint.g.Rect | undefined;

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
        this.drawStart = undefined;
        this.createNewLink = this.createNewLink.bind(this);
    }

    createNewLink(id: string) {
        this.newLink = true;
        this.sid = id;
        graph.getElements().forEach(element => {
            if (typeof element.id === "string") {
                highlightElement(element.id, ElementColors.select);
            }
        });
    }

    saveNewLink(iri: string) {
        if (this.sid && this.tid) {
            this.props.performTransaction(...saveNewLink(iri, this.sid, this.tid));
            this.props.updateElementPanel();
            this.props.updateDetailPanel();
            this.sid = undefined;
            this.tid = undefined;
            this.newLink = false;
            resetDiagramSelection();
        }
    }

    hideElement(cell: joint.dia.Cell) {
        const id = cell.id as string;
        if (ProjectSettings.selectedElements.find(elem => elem === id)) unhighlightElement(id);
        cell.remove();
        ProjectElements[id].hidden[ProjectSettings.selectedDiagram] = true;
        this.props.updateElementPanel();
        this.props.updateDetailPanel();
        this.props.performTransaction(updateProjectElementDiagram(ProjectSettings.selectedDiagram, id));
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

        /**
         * This handles all the various mouse events on the canvas and the elements within.
         * For more information on JointJS events visit https://resources.jointjs.com/docs/jointjs/v3.2/joint.html#dia.Paper.events
         */
        paper.on({
            /**
             * Right click on canvas:
             * open the New Term Modal
             */
            'blank:contextmenu': (evt) => {
                evt.preventDefault();
                if (!this.newLink && PackageRoot.children.find(pkg => !(Schemes[pkg.scheme].readOnly))) {
                    this.setState({modalAddElem: true});
                    this.newConceptEvent = {x: evt.clientX, y: evt.clientY}
                } else this.newLink = false;
                resetDiagramSelection();
                this.props.updateDetailPanel();
            },
            'cell:contextmenu': (cellView, evt) => {
                evt.preventDefault();
            },
            /**
             * Pointer up on element:
             * If the Control key is held, open the Detail Panel and add it to the selection array
             * If in relationship creation mode, open the New Relationship Modal
             * Otherwise if the element position(s) changed, save the change, else open the Detail Panel
             */
            'element:pointerup': (cellView, evt) => {
                if (!this.newLink && !(evt.ctrlKey)) {
                    if (isElementPositionOutdated(cellView.model)) {
                        this.props.performTransaction(...moveElements(cellView.model, evt));
                    } else {
                        resetDiagramSelection();
                        highlightElement(cellView.model.id);
                        this.props.updateElementPanel(cellView.model.id);
                        this.props.updateDetailPanel(cellView.model.id);
                    }
                } else if (evt.ctrlKey) {
                    this.props.updateDetailPanel();
                    const find = ProjectSettings.selectedElements.findIndex(elem => elem === cellView.model.id);
                    find !== -1 ? unhighlightElement(cellView.model.id) : highlightElement(cellView.model.id);
                } else if (this.newLink) {
                    this.tid = cellView.model.id;
                    this.setState({modalAddLink: true});
                }
            },
            /**
             * Mouse enter on element:
             * Show the hide and new relationship buttons (if applicable)
             */
            'element:mouseenter': (elementView) => {
                const id = elementView.model.id;
                const tool = new HideButton({
                    useModelGeometry: false,
                    ...getElementToolPosition(id, true),
                    offset: {x: getElementShape(id) === "bodyTrapezoid" ? -20 : 0, y: 0},
                    action: () => this.hideElement(elementView.model)
                })
                elementView.addTools(new joint.dia.ToolsView({
                    tools: [
                        !(Schemes[VocabularyElements[ProjectElements[id].iri].inScheme].readOnly) && new ElemCreateLink({
                            useModelGeometry: false,
                            ...getElementToolPosition(id),
                            action: (evt: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
                                if (graph.getElements().length > 1) this.createNewLink(evt.currentTarget.getAttribute("model-id"));
                            }
                        }),
                        tool]
                }));
            },
            /**
             * Mouse enter on link:
             * If link is selected, show the delete button (if applicable) and the vertex manipulation tools
             */
            'link:mouseenter': (linkView) => {
                if (ProjectSettings.selectedLink === linkView.model.id) addLinkTools(linkView,
                    this.props.performTransaction, this.props.updateElementPanel);
            },
            /**
             * Mouse leave on cell:
             * Remove buttons and tools of cell from view
             */
            'cell:mouseleave': function (cellView) {
                cellView.removeTools();
            },
            /**
             * Pointer down on canvas:
             * If the left mouse button is held down: reate the blue selection rectangle
             * If the middle mouse button or left mouse button + shift key is held down: prepare for canvas panning
             */
            'blank:pointerdown': (evt, x, y) => {
                if (evt.button === 0 && (!(evt.shiftKey))) {
                    const translate = paper.translate();
                    const point = {
                        x: (x * Diagrams[ProjectSettings.selectedDiagram].scale + translate.tx),
                        y: (y * Diagrams[ProjectSettings.selectedDiagram].scale + translate.ty)
                    }
                    const bbox = new joint.g.Rect(point.x, point.y, 1, 1);
                    const rect = joint.V('rect', {
                        'stroke': 'blue',
                        'fill': 'blue',
                        'fill-opacity': 0.1,
                    });
                    rect.attr(bbox.toJSON());
                    rect.appendTo(paper.svg);
                    evt.data = {
                        rect,
                        ox: point.x,
                        oy: point.y,
                        bbox
                    };
                } else if (evt.button === 1 || (evt.button === 0 && evt.shiftKey)) {
                    const scale = paper.scale();
                    this.drag = {x: x * scale.sx, y: y * scale.sy};
                }
            },
            /**
             * Mouse wheel on canvas: zoom the canvas
             */
            'blank:mousewheel': (evt, x, y, delta) => {
                evt.preventDefault();
                zoomDiagram(x, y, delta);
            },
            /**
             * Pointer move on canvas:
             * Resize the selection box or remove it
             */
            'blank:pointermove': function (evt, x, y) {
                const {
                    ox,
                    oy,
                    rect
                } = evt.data;
                if (evt.buttons === 1 && (!(evt.shiftKey))) {
                    const bbox = new joint.g.Rect(ox, oy,
                        (x * Diagrams[ProjectSettings.selectedDiagram].scale - ox) + Diagrams[ProjectSettings.selectedDiagram].origin.x,
                        ((y * Diagrams[ProjectSettings.selectedDiagram].scale) - oy) + Diagrams[ProjectSettings.selectedDiagram].origin.y);
                    if (bbox.width === 0) bbox.width = 1;
                    if (bbox.height === 0) bbox.height = 1;
                    bbox.normalize();
                    rect.attr(bbox.toJSON());
                    evt.data.bbox = bbox;
                } else if (evt.buttons === 1 && (evt.shiftKey) && rect) {
                    rect.remove();
                }
            },
            /**
             * Pointer down on element:
             * If applicable, create a box encompassing the currently selected elements
             */
            'element:pointerdown': (cellView, evt) => {
                if (evt.button === 0 && ProjectSettings.selectedElements.length > 1 && ProjectSettings.selectedElements.find(elem => elem === cellView.model.id) && !(evt.ctrlKey) && !this.newLink) {
                    const cells = graph.getCellsBBox(ProjectSettings.selectedElements.map(elem => graph.getCell(elem)).filter(cell => cell));
                    if (cells) {
                        const bbox = new joint.g.Rect(
                            cells.x * Diagrams[ProjectSettings.selectedDiagram].scale + Diagrams[ProjectSettings.selectedDiagram].origin.x,
                            cells.y * Diagrams[ProjectSettings.selectedDiagram].scale + Diagrams[ProjectSettings.selectedDiagram].origin.y,
                            cells.width * Diagrams[ProjectSettings.selectedDiagram].scale,
                            cells.height * Diagrams[ProjectSettings.selectedDiagram].scale
                        )
                        const rect = joint.V('rect', {
                            'stroke': 'orange',
                            'fill': 'none',
                            'stroke-width': 3
                        });
                        rect.attr(bbox.toJSON());
                        rect.appendTo(paper.svg);
                        evt.data = {
                            rect,
                            bbox,
                            ox: bbox.x,
                            oy: bbox.y
                        };
                    }
                }
            },
            /**
             * Pointer move on element:
             * If applicable, change the move selection box
             */
            'element:pointermove': (cellView, evt) => {
                if (evt.button === 0 && ProjectSettings.selectedElements.length > 1 &&
                    ProjectSettings.selectedElements.find(elem => elem === cellView.model.id)) {
                    const {rect, bbox, ox, oy} = evt.data;
                    if (rect && bbox && ox && oy) {
                        const newBbox = new joint.g.Rect(
                            (bbox.x + evt.originalEvent.movementX),
                            (bbox.y + evt.originalEvent.movementY),
                            bbox.width,
                            bbox.height,
                        )
                        newBbox.normalize();
                        rect.attr(newBbox.toJSON());
                        evt.data.bbox = newBbox;
                    }
                }
            },
            /**
             * Pointer up on canvas:
             * If panning, save the diagram position
             * Perform selection based on the selection box
             */
            'blank:pointerup': (evt) => {
                updateDiagramPosition(ProjectSettings.selectedDiagram);
                this.drag = undefined;
                if (evt.button === 0 && (!(evt.shiftKey))) {
                    this.props.updateDetailPanel();
                    resetDiagramSelection();
                    const {
                        rect,
                        bbox
                    } = evt.data;
                    if (rect && bbox) {
                        rect.remove();
                        const area = new joint.g.Rect(
                            ((bbox.x) - Diagrams[ProjectSettings.selectedDiagram].origin.x)
                            / Diagrams[ProjectSettings.selectedDiagram].scale,
                            ((bbox.y) - Diagrams[ProjectSettings.selectedDiagram].origin.y)
                            / Diagrams[ProjectSettings.selectedDiagram].scale,
                            bbox.width / Diagrams[ProjectSettings.selectedDiagram].scale,
                            bbox.height / Diagrams[ProjectSettings.selectedDiagram].scale);
                        paper.findViewsInArea(area).forEach((elem) => {
                            const id = elem.model.id as string;
                            highlightElement(id);
                        });
                        this.props.updateElementPanel();
                    }
                }
            },
            /**
             * Pointer click on link:
             * Highlight link and open the Detail panel
             */
            'link:pointerclick': (linkView) => {
                resetDiagramSelection();
                ProjectSettings.selectedLink = linkView.model.id;
                addLinkTools(linkView,
                    this.props.performTransaction, this.props.updateElementPanel);
                highlightCell(linkView.model.id);
                this.props.updateDetailPanel(linkView.model.id);
            },
            /**
             * Pointer up on link:
             * Save changes of link vertices
             */
            'link:pointerup': (cellView) => {
                let id = cellView.model.id;
                let link = cellView.model;
                link.findView(paper).removeRedundantLinearVertices();
                this.props.performTransaction(...updateVertices(id, link.vertices()));
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
                    let queries: string[] = [];
                    const data = JSON.parse(event.dataTransfer.getData("newClass"));
                    const matrixDimension = Math.ceil(Math.sqrt(data.id.length));
                    data.id.filter((id: string) => !(graph.getCell(id))).forEach((id: string, i: number) => {
                        let cls = new graphElement({id: id});
                        drawGraphElement(cls, ProjectSettings.selectedLanguage, ProjectSettings.representation);
                        const point = paper.clientToLocalPoint({x: event.clientX, y: event.clientY});
                        if (data.id.length > 1) {
                            const x = i % matrixDimension;
                            const y = Math.floor(i / matrixDimension);
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
                        ProjectElements[id].hidden[ProjectSettings.selectedDiagram] = false;
                        cls.addTo(graph);
                        this.props.updateElementPanel();
                        queries.push(
                            ...restoreHiddenElem(id, cls, true, true, true),
                            updateProjectElementDiagram(ProjectSettings.selectedDiagram, id));
                    });
                    this.props.performTransaction(...queries);
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
                    if (selectedLink && this.sid && this.tid) this.saveNewLink(selectedLink);
                    else {
                        this.newLink = false;
                        resetDiagramSelection();
                    }
                }}/>
            <NewElemModal
                projectLanguage={this.props.projectLanguage}
                modal={this.state.modalAddElem}
                close={(conceptName?: { [key: string]: string }, pkg?: PackageNode) => {
                    this.setState({modalAddElem: false});
                    if (conceptName && pkg) {
                        const iri = createNewConcept(this.newConceptEvent, conceptName, ProjectSettings.defaultLanguage, pkg);
                        this.props.updateElementPanel();
                        this.props.performTransaction(updateProjectElement(true, iri),
                            updateProjectElementDiagram(ProjectSettings.selectedDiagram, iri));
                    } else {
                        this.newConceptEvent = {x: 0, y: 0}
                    }
                }}/>
        </div>);
    }
}
