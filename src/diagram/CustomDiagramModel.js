import {
    AbstractLabelFactory,
    AbstractLinkFactory,
    AbstractNodeFactory,
    AbstractPortFactory,
    DiagramModel, LinkModel, NodeModel,
    Toolkit
} from "storm-react-diagrams";


export class CustomDiagramModel extends DiagramModel {

    selectedLink: string;
    language: string;

    //models
    links: { [s: string]: LinkModel };
    nodes: { [s: string]: NodeModel };

    //control variables
    offsetX: number;
    offsetY: number;
    zoom: number;
    rendered: boolean;
    gridSize: number;

    constructor() {
        super();

        this.links = {};
        this.nodes = {};

        this.offsetX = 0;
        this.offsetY = 0;
        this.zoom = 100;
        this.rendered = false;
        this.gridSize = 0;

        this.selectedLink = "common";
        this.language = "cs";
    }

}