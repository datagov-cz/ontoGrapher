import { NodeModel, DiagramEngine } from "storm-react-diagrams";
import {NodeCommonPortModel} from "./NodeCommonPortModel";
import {AttributeObject} from "../common/AttributeObject";

export class NodeCommonModel extends NodeModel {
    constructor(name: string = "New Common", color: string = "white") {
        super("common");
        this.name = name;
        this.color = color;
        this.attributes = [];
        this.addPort(new NodeCommonPortModel("left"));
        this.addPort(new NodeCommonPortModel("right"));
        this.addPort(new NodeCommonPortModel("top"));
        this.addPort(new NodeCommonPortModel("bottom"));
    }
    changeName(str: string){
        this.name = str;
    }

    getAttributes(){
        return this.attributes;
}
    getAttribute(id: number){
        return this.attributes[id];
    }
    addAttribute(attribute: AttributeObject){
        this.attributes.push(attribute);
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
            attributes: _.map(this.attributes, attribute => {
                return {
                    first: attribute.first,
                    second: attribute.second
                };
            })
        });
    }
}