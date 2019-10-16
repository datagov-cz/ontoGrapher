import {DiagramEngine, DiagramModel, LinkModel, NodeModel} from "storm-react-diagrams";
import {DiagramCanvas} from "./DiagramCanvas";
import {Locale} from "../config/locale/Locale";
import * as _ from "lodash";
import {GeneralizationPool, LanguagePool} from "../config/Variables";

export class OntoDiagramModel extends DiagramModel {

    selectedLink: string;
    language: string;
    firstCardinality: string;
    secondCardinality: string;
    canvas: DiagramCanvas;
    name: string;
    notes: string;
    generalizations: [];

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
        this.name = Locale.untitled;
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

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }

    getNotes(){
        return this.notes;
    }

    setNotes(notes: string){
        this.notes = notes;
    }

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
            notes: this.notes,
            links: _.map(this.links, link => {
                return link.serialize();
            }),
            nodes: _.map(this.nodes, node => {
                return node.serialize();
            }),
            languages: _.map(Object.entries(LanguagePool), language => {
                return language;
            }),
            generalizations: _.map(Object.entries(GeneralizationPool), generalization => {
                let array = [];
                for (let item of generalization[1]){
                    array.push(item.id);
                }
                return [generalization[0],array];
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
        this.notes = object.notes;
        // deserialize nodes
        _.forEach(object.nodes, (node: any) => {
            let nodeOb = diagramEngine.getNodeFactory(node.type).getNewInstance(node);
            nodeOb.setParent(this);
            nodeOb.model = this;
            nodeOb.deSerialize(node, diagramEngine);
            for (let key in nodeOb.getPorts()) {
                nodeOb.getPorts()[key].model = this;
            }
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
        for (let generalization in GeneralizationPool){
            delete GeneralizationPool[generalization];
        }
        for (let entry in object.generalizations){
            let array = [];
            for (let item of object.generalizations[entry][1]){
                array.push(this.getNodes()[item]);
            }
            GeneralizationPool[object.generalizations[entry][0]] = array;
        }
        this.canvas.setName(object._name);
    }

}