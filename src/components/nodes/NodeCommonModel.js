import { NodeModel, DiagramEngine } from "storm-react-diagrams";
import {NodeCommonPortModel} from "./NodeCommonPortModel";
import {AttributeObject} from "./AttributeObject";
import {CustomDiagramModel} from "../../diagram/CustomDiagramModel";
import {LanguagePool} from "../../config/LanguagePool";
import {AttributeTypePool} from "../../config/AttributeTypePool";
export class NodeCommonModel extends NodeModel {
    stereotype: string;
    attributes: {};
    names: {};
    model: CustomDiagramModel;

    constructor(stereotype: string, rdf: string, model: CustomDiagramModel) {
        super("common");
        this.model = model;
        this.names = {
            cs: "Nepojmenovaný",
            en: "Untitled",
            es: "Intitulado"
        };
        this.rdf = rdf;
        this.attributes = {};
        for (let language in LanguagePool){
            this.attributes[language] = [];
            if (this.names[language] === undefined){
                this.names[language] = "undefined";
            }
        }

        this.stereotype = stereotype;
        this.addPort(new NodeCommonPortModel("left", this.model));
        this.addPort(new NodeCommonPortModel("right", this.model));
        this.addPort(new NodeCommonPortModel("top", this.model));
        this.addPort(new NodeCommonPortModel("bottom", this.model));
        this.addListener({
            selectionChanged: event => {this.model.updatePanel();}
        });
    }

    changeName(str: string){
        this.name = str;
    }

    setName(str: string, language: string){
        this.names[language] = str;
    }

    getName(str: string){
        return this.names[str];
    }
    getAttributesByLanguage(str: string){
        return this.attributes[str];
    }
    getAttributes(){
        return this.attributes;
}
    getAttribute(id: number){
        return this.attributes[id];
    }
    addAttribute(language: string, attr: AttributeObject){
        this.attributes[language].push(attr);
    }
    addAttribute(attr: AttributeObject){
        for(let language in LanguagePool){
            this.attributes[language].push(attr);
        }
    }
    removeAttributeByIndex(index: number, language: string){
        this.attributes[language].splice(index,1);
    }
    removeAttributeByIndex(index: number){
        for(let language in LanguagePool){
            this.attributes[language].splice(index,1);
        }
    }
    removeAttribute(attribute: AttributeObject){
        const index = this.attributes.find(attribute);
        this.attributes.splice(index,1);
    }
    setAttribute(attribute: AttributeObject){
        this.attributes[this.attributes.find(attribute)] = attribute;
    }
    setAttribute(language: string, attr: Attribute, index: number){
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
        for (let port in this.ports){
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
            rdf: this.rdf
        });
    }
}