import {Diagrams, ProjectSettings} from "../config/Variables";
import * as joint from "jointjs";
import {graphElement} from "../graph/graphElement";
import {graph} from "../graph/graph";

export function changeDiagrams(diagram: any) {
    ProjectSettings.selectedDiagram = diagram;
    graph.fromJSON(Diagrams[diagram].json);
}

export function saveDiagram() {
    let cells = graph.getCells();
    let elements = [];
    let links = [];
    for (let cell of cells) {
        if (!(cell.isLink())) {
            elements.push({
                id: cell.id,
                pos: cell.get('position'),
                label: cell.attr('label/text')
            });
        }
    }

    for (let link of graph.getLinks()) {
        links.push({
            id: link.id,
            source: link.getSourceCell()?.id,
            target: link.getTargetCell()?.id,
            vertices: link.vertices(),
            labels: link.labels()
        });
    }
    return {elements: elements, links: links}
}

export function loadDiagram(load: {
    elements: {
        id: any;
        label: any;
        pos: any;
    }[], links: {
        id: string,
        vertices: { (): joint.dia.Link.Vertex[]; (vertices: joint.dia.Link.Vertex[]): joint.shapes.standard.Link };
        labels: any;
        target: string;
        source: string;
    }[]
}) {
    graph.clear();
    for (let elem of load.elements) {
        // @ts-ignore
        let cls = graphElement.create(elem.id).prop({
            //size: {width: 180, height: 50},
            position: elem.pos,
            attrs: {label: {text: elem.label, magnet: true}}
        });
        cls.addTo(graph);
    }
    for (let link of load.links) {
        let lnk = new joint.shapes.standard.Link({id: link.id});
        lnk.source({id: link.source});
        lnk.target({id: link.target});
        lnk.labels(link.labels);
        // @ts-ignore
        lnk.vertices(link.vertices);
        lnk.addTo(graph);
    }
}