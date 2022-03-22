import React from "react";
import * as joint from "jointjs";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { graph } from "../graph/Graph";
import { HideButton } from "../graph/elementTool/ElemHide";
import { ElemCreateLink } from "../graph/elementTool/ElemCreateLink";
import {
  getElementShape,
  getNewLink,
  getVocabularyFromScheme,
} from "../function/FunctionGetVars";
import { highlightCell, unHighlightAll } from "../function/FunctionDraw";
import {
  highlightElement,
  highlightLink,
  resetDiagramSelection,
  unhighlightElement,
  unhighlightLink,
  updateDiagramPosition,
  zoomDiagram,
} from "../function/FunctionDiagram";
import { updateProjectElementDiagram } from "../queries/update/UpdateElementQueries";
import {
  getElementToolPosition,
  isElementPositionOutdated,
  moveElements,
  putElementsOnCanvas,
} from "../function/FunctionElem";
import { addLinkTools, updateVertices } from "../function/FunctionLink";
import { ElementColors } from "../config/visual/ElementColors";
import hotkeys from "hotkeys-js";
import * as _ from "lodash";
import {
  ElemCreationConfiguration,
  LinkCreationConfiguration,
} from "../components/modals/CreationModals";
import { DetailPanelMode, ElemCreationStrategy } from "../config/Enum";
import { Locale } from "../config/Locale";
import { initTouchEvents } from "../function/FunctionTouch";

interface Props {
  projectLanguage: string;
  updateElementPanel: (id?: string, redoCacheSearch?: boolean) => void;
  updateDetailPanel: (mode: DetailPanelMode, id?: string) => void;
  freeze: boolean;
  performTransaction: (...queries: string[]) => void;
  handleCreation: (
    configuration: LinkCreationConfiguration | ElemCreationConfiguration
  ) => void;
  handleStatus: Function;
}

interface State {}

export var paper: joint.dia.Paper;

export default class DiagramCanvas extends React.Component<Props, State> {
  private readonly canvasRef: React.RefObject<HTMLDivElement>;
  private drag: { x: any; y: any } | undefined;
  private newLink: boolean;
  private sid: string;
  private tid: string;
  private drawStart: joint.g.Rect | undefined;

  constructor(props: Props) {
    super(props);
    this.canvasRef = React.createRef();
    this.componentDidMount = this.componentDidMount.bind(this);
    this.drag = undefined;
    this.newLink = false;
    this.sid = "";
    this.tid = "";
    this.drawStart = undefined;
    this.createNewLink = this.createNewLink.bind(this);
  }

  createNewLink(id: string) {
    this.newLink = true;
    this.sid = id;
    graph.getElements().forEach((element) => {
      highlightCell(element.id as string, ElementColors.select);
    });
  }

  hideElements(cells: joint.dia.Cell[]) {
    const ids = cells.map((cell) => cell.id as string);
    cells.forEach((cell) => cell.remove());
    ids.forEach(
      (id) => (WorkspaceElements[id].hidden[AppSettings.selectedDiagram] = true)
    );
    if (_.intersection(AppSettings.selectedElements, ids).length > 0)
      this.props.updateDetailPanel(DetailPanelMode.HIDDEN);
    _.pull(AppSettings.selectedElements, ...ids);
    this.props.updateElementPanel();
    this.props.performTransaction(
      updateProjectElementDiagram(AppSettings.selectedDiagram, ...ids)
    );
  }

  componentDidMount(): void {
    const node = this.canvasRef.current! as HTMLElement;
    const hammer = require("hammerjs");
    const hammerManager = new hammer.Manager(node, { domEvents: true });
    initTouchEvents(hammerManager);

    paper = new joint.dia.Paper({
      el: node,
      model: graph,
      width: "auto",
      height: "100vh",
      gridSize: 1,
      linkPinning: false,
      background: {
        color: "#e3e3e3",
      },
      clickThreshold: 0,
      async: false,
      sorting: joint.dia.Paper.sorting.APPROX,
      connectionStrategy: joint.connectionStrategies.pinAbsolute,
      defaultConnectionPoint: {
        name: "boundary",
        args: { sticky: true, selector: "bodyBox" },
      },
      defaultLink: function () {
        return getNewLink();
      },
    });

    /**
     * This handles all the various mouse events on the canvas and the elements within.
     * For more information on JointJS events visit
     * https://resources.jointjs.com/docs/jointjs/v3.2/joint.html#dia.Paper.events
     */
    paper.on({
      /**
       * Right click on canvas:
       * open the New Term Modal
       */
      "blank:contextmenu": (evt) => {
        evt.preventDefault();
        const vocabulary = Object.keys(WorkspaceVocabularies).find(
          (vocab) => !WorkspaceVocabularies[vocab].readOnly
        );
        if (vocabulary) {
          this.props.handleCreation({
            strategy: ElemCreationStrategy.DEFAULT,
            position: { x: evt.clientX, y: evt.clientY },
            vocabulary: vocabulary,
            header: Locale[AppSettings.interfaceLanguage].modalNewElemTitle,
            connections: [],
          });
        }
        this.newLink = false;
        unHighlightAll();
        resetDiagramSelection();
        this.props.updateDetailPanel(DetailPanelMode.HIDDEN);
      },
      "cell:contextmenu": (cellView, evt) => {
        evt.preventDefault();
      },
      /**
       * Pointer up on element:
       * If the Control key is held, open the Detail Panel and add it to the selection array
       * If in relationship creation mode, open the New Relationship Modal
       * Otherwise if the element position(s) changed, save the change, else open the Detail Panel
       */
      "element:pointerup": (cellView, evt) => {
        const { rect } = evt.data;
        if (rect) rect.remove();
        if (!this.newLink && !evt.ctrlKey) {
          if (isElementPositionOutdated(cellView.model)) {
            this.props.performTransaction(...moveElements(cellView.model, evt));
          } else {
            resetDiagramSelection();
            highlightElement(cellView.model.id);
            this.props.updateElementPanel(cellView.model.id);
            this.props.updateDetailPanel(
              DetailPanelMode.TERM,
              cellView.model.id
            );
          }
        } else if (evt.ctrlKey) {
          this.props.updateDetailPanel(DetailPanelMode.HIDDEN);
          const find = AppSettings.selectedElements.findIndex(
            (elem) => elem === cellView.model.id
          );
          find !== -1
            ? unhighlightElement(cellView.model.id)
            : highlightElement(cellView.model.id);
        } else if (this.newLink) {
          this.tid = cellView.model.id;
          this.props.handleCreation({ sourceID: this.sid, targetID: this.tid });
          this.newLink = false;
          unHighlightAll();
        }
      },
      /**
       * Mouse enter on element:
       * Show the hide and new relationship buttons (if applicable)
       */
      "element:mouseenter": (elementView) => {
        const id = elementView.model.id;
        const tool = new HideButton({
          useModelGeometry: false,
          ...getElementToolPosition(id, true),
          offset: {
            x: getElementShape(id) === "bodyTrapezoid" ? -20 : 0,
            y: 0,
          },
          action: () => this.hideElements([elementView.model]),
        });
        elementView.addTools(
          new joint.dia.ToolsView({
            tools: [
              !WorkspaceVocabularies[
                getVocabularyFromScheme(WorkspaceTerms[id].inScheme)
              ].readOnly &&
                new ElemCreateLink({
                  useModelGeometry: false,
                  ...getElementToolPosition(id),
                  action: (evt: {
                    currentTarget: { getAttribute: (arg0: string) => any };
                  }) => {
                    if (graph.getElements().length > 1)
                      this.createNewLink(
                        evt.currentTarget.getAttribute("model-id")
                      );
                  },
                }),
              tool,
            ],
          })
        );
      },
      /**
       * Mouse enter on link:
       * If link is selected, show the delete button (if applicable) and the vertex manipulation tools
       */
      "link:mouseenter": (linkView) => {
        if (
          AppSettings.selectedLinks.includes(linkView.model.id) &&
          AppSettings.selectedLinks.length === 1
        )
          addLinkTools(
            linkView,
            this.props.performTransaction,
            this.props.updateElementPanel
          );
      },
      /**
       * Mouse leave on cell:
       * Remove buttons and tools of cell from view
       */
      "cell:mouseleave": function (cellView) {
        cellView.removeTools();
      },
      /**
       * Pointer down on canvas:
       * If the left mouse button + shift key is held down: create the blue selection rectangle
       * If the left mouse button is held down: prepare for canvas panning
       */
      "blank:pointerdown": (evt, x, y) => {
        if (evt.button === 0 && evt.shiftKey) {
          const translate = paper.translate();
          const point = {
            x: x * Diagrams[AppSettings.selectedDiagram].scale + translate.tx,
            y: y * Diagrams[AppSettings.selectedDiagram].scale + translate.ty,
          };
          const bbox = new joint.g.Rect(point.x, point.y, 1, 1);
          const rect = joint.V("rect", {
            stroke: "blue",
            fill: "blue",
            "fill-opacity": 0.1,
          });
          rect.attr(bbox.toJSON());
          rect.appendTo(paper.svg);
          evt.data = {
            rect,
            ox: point.x,
            oy: point.y,
            bbox,
          };
        } else if (evt.button === 0) {
          const scale = paper.scale();
          this.drag = { x: x * scale.sx, y: y * scale.sy };
        }
      },
      /**
       * Mouse wheel on canvas: zoom the canvas
       */
      "blank:mousewheel": (evt, x, y, delta) => {
        evt.preventDefault();
        zoomDiagram(x, y, delta);
      },
      /**
       * Pointer move on canvas:
       * Resize the selection box or remove it
       */
      "blank:pointermove": function (evt, x, y) {
        const { ox, oy, rect } = evt.data;
        if (evt.button === 0 && evt.shiftKey) {
          const bbox = new joint.g.Rect(
            ox,
            oy,
            x * Diagrams[AppSettings.selectedDiagram].scale -
              ox +
              Diagrams[AppSettings.selectedDiagram].origin.x,
            y * Diagrams[AppSettings.selectedDiagram].scale -
              oy +
              Diagrams[AppSettings.selectedDiagram].origin.y
          );
          if (bbox.width === 0) bbox.width = 1;
          if (bbox.height === 0) bbox.height = 1;
          bbox.normalize();
          rect.attr(bbox.toJSON());
          evt.data.bbox = bbox;
        } else if (evt.button === 0 && rect) {
          rect.remove();
        }
      },
      /**
       * Pointer down on element:
       * If applicable, create a box encompassing the currently selected elements
       */
      "element:pointerdown": (cellView, evt) => {
        if (
          evt.button === 0 &&
          AppSettings.selectedElements.length > 1 &&
          AppSettings.selectedElements.find(
            (elem) => elem === cellView.model.id
          ) &&
          !evt.ctrlKey &&
          !this.newLink
        ) {
          const cells = graph.getCellsBBox(
            AppSettings.selectedElements
              .map((elem) => graph.getCell(elem))
              .filter((cell) => cell)
          );
          if (cells) {
            const bbox = new joint.g.Rect(
              cells.x * Diagrams[AppSettings.selectedDiagram].scale +
                Diagrams[AppSettings.selectedDiagram].origin.x,
              cells.y * Diagrams[AppSettings.selectedDiagram].scale +
                Diagrams[AppSettings.selectedDiagram].origin.y,
              cells.width * Diagrams[AppSettings.selectedDiagram].scale,
              cells.height * Diagrams[AppSettings.selectedDiagram].scale
            );
            const rect = joint.V("rect", {
              stroke: "orange",
              fill: "none",
              "stroke-width": 3,
            });
            rect.attr(bbox.toJSON());
            rect.appendTo(paper.svg);
            evt.data = {
              rect,
              bbox,
              ox: bbox.x,
              oy: bbox.y,
            };
          }
        }
      },
      /**
       * Pointer move on element:
       * If applicable, change the move selection box
       */
      "element:pointermove": (cellView, evt) => {
        if (
          evt.button === 0 &&
          AppSettings.selectedElements.length > 1 &&
          AppSettings.selectedElements.find(
            (elem) => elem === cellView.model.id
          )
        ) {
          const { rect, bbox, ox, oy } = evt.data;
          if (rect && bbox && ox && oy) {
            const newBbox = new joint.g.Rect(
              bbox.x + evt.originalEvent.movementX,
              bbox.y + evt.originalEvent.movementY,
              bbox.width,
              bbox.height
            );
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
      "blank:pointerup": (evt) => {
        updateDiagramPosition(AppSettings.selectedDiagram);
        this.drag = undefined;
        if (evt.button === 0 || evt.type === "touchend") {
          this.props.updateDetailPanel(DetailPanelMode.HIDDEN);
          resetDiagramSelection();
          if (this.newLink) {
            this.newLink = false;
            unHighlightAll();
          }
          const { rect, bbox } = evt.data;
          if (rect && bbox) {
            rect.remove();
            const area = new joint.g.Rect(
              (bbox.x - Diagrams[AppSettings.selectedDiagram].origin.x) /
                Diagrams[AppSettings.selectedDiagram].scale,
              (bbox.y - Diagrams[AppSettings.selectedDiagram].origin.y) /
                Diagrams[AppSettings.selectedDiagram].scale,
              bbox.width / Diagrams[AppSettings.selectedDiagram].scale,
              bbox.height / Diagrams[AppSettings.selectedDiagram].scale
            );
            paper.findViewsInArea(area).forEach((elem) => {
              const id = elem.model.id as string;
              highlightElement(id);
            });
          }
          this.props.updateElementPanel();
        }
      },
      /**
       * Pointer click on link:
       * Highlight link and open the Detail panel
       */
      "link:pointerclick": (linkView, evt) => {
        if (evt.ctrlKey) {
          this.props.updateDetailPanel(DetailPanelMode.HIDDEN);
          const find = AppSettings.selectedLinks.findIndex(
            (elem) => elem === linkView.model.id
          );
          find !== -1
            ? unhighlightLink(linkView.model.id)
            : highlightLink(linkView.model.id);
          if (AppSettings.selectedLinks.length > 1)
            this.props.updateDetailPanel(DetailPanelMode.MULTIPLE_LINKS);
          else
            this.props.updateDetailPanel(
              DetailPanelMode.LINK,
              linkView.model.id
            );
        } else {
          resetDiagramSelection();
          if (this.newLink) {
            this.newLink = false;
            unHighlightAll();
          }
          highlightLink(linkView.model.id);
          addLinkTools(
            linkView,
            this.props.performTransaction,
            this.props.updateElementPanel
          );
          this.props.updateDetailPanel(DetailPanelMode.LINK, linkView.model.id);
        }
      },
      /**
       * Pointer up on link:
       * Save changes of link vertices
       */
      "link:pointerup": (cellView) => {
        const id = cellView.model.id;
        const link = cellView.model;
        link.findView(paper).removeRedundantLinearVertices();
        this.props.performTransaction(...updateVertices(id, link.vertices()));
      },
      /**
       * Pointer double-click on link:
       * Save changes of link vertices
       */
      "link:pointerdblclick": (cellView) => {
        const id = cellView.model.id;
        const link = cellView.model;
        link.findView(paper).removeRedundantLinearVertices();
        this.props.performTransaction(...updateVertices(id, link.vertices()));
      },
    });

    /*
     * Keyboard events
     */

    /**
     * Delete key: Hide selected elements
     */
    hotkeys("delete", () => {
      this.hideElements(
        graph
          .getElements()
          .filter((elem) =>
            AppSettings.selectedElements.includes(elem.id as string)
          )
      );
    });

    /**
     * Ctrl + A: Select all elements on canvas
     */
    hotkeys("ctrl+a", (event) => {
      event.preventDefault();
      _.pull(
        graph.getElements().map((elem) => elem.id as string),
        ...AppSettings.selectedElements
      ).forEach((id) => highlightElement(id));
    });
  }

  render() {
    return (
      <div
        style={{
          cursor: this.props.freeze ? "not-allowed" : "inherit",
          opacity: this.props.freeze ? "0.5" : "1",
        }}
      >
        <div
          className={"canvas"}
          id={"canvas"}
          ref={this.canvasRef}
          style={{
            pointerEvents: this.props.freeze ? "none" : "auto",
          }}
          onDragOver={(event) => {
            if (!this.props.freeze) event.preventDefault();
          }}
          onMouseMove={(event) => {
            if (this.drag && !this.props.freeze) {
              paper.translate(
                event.nativeEvent.offsetX - this.drag.x,
                event.nativeEvent.offsetY - this.drag.y
              );
            }
          }}
          onDrop={(event) => {
            putElementsOnCanvas(event, this.props.handleStatus).then(
              (queries) => {
                this.props.performTransaction(...queries);
                this.props.updateElementPanel(undefined, true);
              }
            );
          }}
        />
      </div>
    );
  }
}
