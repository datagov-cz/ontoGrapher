import { NodeModel, DiagramEngine } from "storm-react-diagrams";
import {NodeMixinPortModel} from "./NodeMixinPortModel";
import {AttributeObject} from "../common/AttributeObject";

export class NodeMixinModel extends NodeModel {
    constructor(name: string = "New Mixin", color: string = "white") {
        super("mixin");
        this.name = name;
        this.color = color;
        this.attributes = [];
        this.addPort(new NodeMixinPortModel("left"));
        this.addPort(new NodeMixinPortModel("right"));
        this.addPort(new NodeMixinPortModel("top"));
        this.addPort(new NodeMixinPortModel("bottom"));
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