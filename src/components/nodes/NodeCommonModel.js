import { NodeModel, DiagramEngine } from "storm-react-diagrams";
import {NodeCommonPortModel} from "./NodeCommonPortModel";
import {AttributeObject} from "./AttributeObject";
import {NameObject} from "./NameObject";
import {CustomDiagramModel} from "../../diagram/CustomDiagramModel";
export class NodeCommonModel extends NodeModel {
    stereotype: string;
    attributes: {};
    names: {};
    model: CustomDiagramModel

    constructor(stereotype: string, model: CustomDiagramModel) {
        super("common");
        this.model = model;
        this.names = {
            cs: "Běžný",
            en: "Common"
        };
        /*
        this.names.push(new NameObject("cs","Běžný"));
        this.names.push(new NameObject("en","Common"));
         */
        this.attributes = {
          cs: [],
          en: []
        };

        this.stereotype = stereotype;
        this.addPort(new NodeCommonPortModel("left"));
        this.addPort(new NodeCommonPortModel("right"));
        this.addPort(new NodeCommonPortModel("top"));
        this.addPort(new NodeCommonPortModel("bottom"));
    }

    changeName(str: string){
        this.name = str;
    }

    setName(str: string, language: string){
        this.names[language] = str;
        console.log(this.names);
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
    removeAttributeByIndex(index: number, language: string){
        this.attributes[language].splice(index,1);
    }
    removeAttribute(attribute: AttributeObject){
        const index = this.attributes.find(attribute);
        this.attributes.splice(index,1);
    }
    setAttribute(attribute: AttributeObject){
        this.attributes[this.attributes.find(attribute)] = attribute;
    }

    deSerialize(object, engine: DiagramEngine) {
        super.deSerialize(object, engine);
        this.name = object.name;
        this.color = object.color;
        this.stereotype = object.stereotype;
        let atts = [];
        _.forEach(object.attributes, (attribute: any) => {
            atts.push(attribute);
        });
        this.attributes = atts;
    }

    serialize() {
        return _.merge(super.serialize(), {
            name: this.name,
            color: this.color,
            stereotype: this. stereotype,
            attributes: _.map(this.attributes, attribute => {
                return {
                    first: attribute.first,
                    second: attribute.second
                };
            })
        });
    }
}