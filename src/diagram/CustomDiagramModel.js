import {
    DiagramEngine,
    DiagramModel, LinkModel, NodeModel
} from "storm-react-diagrams";

export class CustomDiagramModel extends DiagramModel {

    selectedLink: string;
    language: string;
    firstcard: string;
    secondcard: string;

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

        this.selectedLink = "Mediation";
        this.language = "cs";
        this.firstcard = "1";
        this.secondcard = "1";
    }
    serializeDiagram(){
        return _.merge(this.serialize(), {
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            zoom: this.zoom,
            gridSize: this.gridSize,
            selectedLink: this.selectedLink,
            language: this.language,
            firstcard: this.firstcard,
            secondcard: this.secondcard,
            links: _.map(this.links, link => {
                return link.serialize();
            }),
            nodes: _.map(this.nodes, node => {
                return node.serialize();
            })
        });
    }

    deSerializeDiagram(object: any, diagramEngine: DiagramEngine) {
        this.deSerialize(object, diagramEngine);

        this.offsetX = object.offsetX;
        this.offsetY = object.offsetY;
        this.zoom = object.zoom;
        this.gridSize = object.gridSize;
        this.selectedLink = object.selectedLink;
        this.language = object.language;
        this.firstcard = object.firstcard;
        this.secondcard = object.secondcard;

        // deserialize nodes
        _.forEach(object.nodes, (node: any) => {
            let nodeOb = diagramEngine.getNodeFactory(node.type).getNewInstance(node);
            nodeOb.setParent(this);
            nodeOb.deSerialize(node, diagramEngine);
            this.addNode(nodeOb);
        });

        // deserialze links
        _.forEach(object.links, (link: any) => {
            let linkOb = diagramEngine.getLinkFactory(link.type).getNewInstance();
            linkOb.setParent(this);
            linkOb.deSerialize(link, diagramEngine);
            this.addLink(linkOb);
        });
    }

}