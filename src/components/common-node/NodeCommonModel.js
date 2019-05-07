import {NodeModel, DiagramEngine} from "storm-react-diagrams";
import {NodeCommonPortModel} from "./NodeCommonPortModel";
import {AttributeObject} from "../misc/AttributeObject";
import {OntoDiagramModel} from "../../diagram/OntoDiagramModel";
import * as _ from "lodash";
import {LanguagePool} from "../../config/Variables";

export class NodeCommonModel extends NodeModel {
    stereotype: string;
    attributes: {};
    names: {};
    model: OntoDiagramModel;

    constructor(stereotype: string, rdf: string, model: OntoDiagramModel) {
        super("common");
        this.model = model;
        this.rdf = rdf;
        this.names = {};
        this.attributes = {};
        this.notes = {};
        for (let language in LanguagePool) {
            this.attributes[language] = [];
            this.notes[language] = "";
            if (this.names[language] === undefined) {
                this.names[language] = "untitled";
            }
        }
        this.stereotype = stereotype;
        this.addPort(new NodeCommonPortModel("left", this.model));
        this.addPort(new NodeCommonPortModel("right", this.model));
        this.addPort(new NodeCommonPortModel("top", this.model));
        this.addPort(new NodeCommonPortModel("bottom", this.model));
        this.addListener({
            selectionChanged: () => {
                this.model.updatePanel();
            },
            entityRemoved: () => {
                this.model.nullPanel();
            }
        });
    }

    setName(name: string, language: string) {
        this.names[language] = name;
    }

    getNameByLanguage(language: string) {
        if (this.names[language] === undefined){
            this.names[language] = "untitled";
        }
        return this.names[language];
    }

    getAttributesByLanguage(language: string) {
        if (this.attributes[language] === undefined){
            this.attributes[language] = [];
        }
        return this.attributes[language];

    }

    addAttribute(attribute: AttributeObject) {
        for (let language in LanguagePool) {
            this.attributes[language].push(attribute);
        }
    }

    removeAttributeByIndexAndLanguage(index: number, language: string) {
        this.attributes[language].splice(index, 1);
    }

    removeAttributeByIndex(index: number) {
        if (Object.entries(this.attributes).length > 0 && index >= 0) {
            for (let language in LanguagePool) {
                this.attributes[language].splice(index, 1);
            }
        }
    }

    setAttribute(attribute: AttributeObject) {
        this.attributes[this.attributes.find(attribute)] = attribute;
    }

    setAttributeWithLanguageAndIndex(language: string, attr: Attribute, index: number) {
        this.attributes[language][index] = attr;
    }

    deSerialize(object, engine: DiagramEngine) {
        super.deSerialize(object, engine);
        this.name = object.name;
        this.color = object.color;
        this.stereotype = object.stereotype;
        this.attributes = object.attributes;
        this.names = object.names;
        this.rdf = object.rdf;
        for (let port in this.ports) {
            this.ports[port].model = this.model;
        }
    }

    serialize() {
        return _.merge(super.serialize(), {
            name: this.name,
                color: this.color,
            stereotype: this.stereotype,
            attributes: this.attributes,
            names: this.names,
            rdf: this.rdf,
            notes: this.notes
        });
    }

    getLinks(){
        let links = [];
        for (let port in this.getPorts()){
            for (let link in this.getPorts()[port].getLinks()){
                links.push(this.getPorts()[port].getLinks()[link]);
            }
        }
    }
}