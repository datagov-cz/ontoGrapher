import {
    DiagramEngine,
    DiagramModel, LinkModel, NodeModel
} from "storm-react-diagrams";
import {DiagramCanvas} from "./DiagramCanvas";
import {Locale} from "../config/Locale";
import {LanguagePool} from "../config/LanguagePool";

export class OntoDiagramModel extends DiagramModel {

    selectedLink: string;
    language: string;
    firstCardinality: string;
    secondCardinality: string;
    canvas: DiagramCanvas;
    name: string;

    //models
    links: { [s: string]: LinkModel };
    nodes: { [s: string]: NodeModel };

    //control variables
    offsetX: number;
    offsetY: number;
    zoom: number;
    rendered: boolean;
    gridSize: number;

    constructor(props, canvas) {
        super();

        this.links = {};
        this.nodes = {};
        this.name = Locale.untitledDiagram;
        this.notes = "";

        this.offsetX = 0;
        this.offsetY = 0;
        this.zoom = 100;
        this.rendered = false;
        this.gridSize = 0;

        this.canvas = canvas;
        this.selectedLink = props.selectedLink;
        this.language = props.language;
        this.firstCardinality = props.firstCardinality;
        this.secondCardinality = props.secondCardinality;
    }

    updatePanel() {
        this.canvas.updatePanel();
    }

    nullPanel() {
        this.canvas.nullPanel();
    }
    // TODO: update serialization data
    serializeDiagram() {
        return _.merge(this.serialize(), {
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            zoom: this.zoom,
            gridSize: this.gridSize,
            selectedLink: this.selectedLink,
            language: this.language,
            firstCardinality: this.firstCardinality,
            secondCardinality: this.secondCardinality,
            name: this.name,
            links: _.map(this.links, link => {
                return link.serialize();
            }),
            nodes: _.map(this.nodes, node => {
                return node.serialize();
            }),
            languages: _.map(Object.entries(LanguagePool), language => {
                return language;
            })
        });
    }

    deSerializeDiagram(object: any, diagramEngine: DiagramEngine) {
        this.deSerialize(object, diagramEngine);

        this.offsetX = object.offsetX;
        this.offsetY = object.offsetY;
        this.zoom = object.zoom;
        this.gridSize = object.gridSize;
        this.language = object.language;
        this.selectedLink = object.selectedLink;
        this.firstCardinality = object.firstCardinality;
        this.secondCardinality = object.secondCardinality;
        this.name = object.name;
        // deserialize nodes
        _.forEach(object.nodes, (node: any) => {
            let nodeOb = diagramEngine.getNodeFactory(node.type).getNewInstance(node);
            nodeOb.setParent(this);
            nodeOb.model = this;
            nodeOb.deSerialize(node, diagramEngine);
            this.addNode(nodeOb);
        });

        // deserialize links
        _.forEach(object.links, (link: any) => {
            let linkOb = diagramEngine.getLinkFactory(link.type).getNewInstance();
            linkOb.setParent(this);
            linkOb.model = this;
            linkOb.deSerialize(link, diagramEngine);
            this.addLink(linkOb);
        });
        for (let language in LanguagePool) {
            delete LanguagePool[language];
        }
        for (let entry in object.languages) {
            LanguagePool[object.languages[entry][0]] = object.languages[entry][1];
        }
        this.canvas.setName(object.name);
    }

}