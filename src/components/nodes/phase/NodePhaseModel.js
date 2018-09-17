import { NodeModel, DiagramEngine } from "storm-react-diagrams";
import {NodePhasePortModel} from "./NodePhasePortModel";
import {AttributeObject} from "../common/AttributeObject";

export class NodePhaseModel extends NodeModel {
    constructor(name: string = "New Phase", color: string = "white") {
        super("phase");
        this.name = name;
        this.color = color;
        this.attributes = [];
        this.addPort(new NodePhasePortModel("left"));
        this.addPort(new NodePhasePortModel("right"));
        this.addPort(new NodePhasePortModel("top"));
        this.addPort(new NodePhasePortModel("bottom"));
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