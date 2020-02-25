import * as joint from 'jointjs';

export class DiagramModel {
    private graph: joint.dia.Graph;
    constructor() {
        this.graph = new joint.dia.Graph;
    }

    getGraph(){
        return this.graph;
    }

    serialize(){
        return this.graph.toJSON();
    }

    deserialize(json: any){
        this.graph.fromJSON(json);
    }
}