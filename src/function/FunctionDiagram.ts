import {Diagrams, ProjectElements, ProjectLinks, ProjectSettings} from "../config/Variables";
import * as joint from "jointjs";
import {graphElement} from "../graph/GraphElement";
import {graph} from "../graph/Graph";
import {Locale} from "../config/Locale";
import {drawGraphElement} from "./FunctionDraw";
import {getElementShape, getNewLink} from "./FunctionGetVars";

export function changeDiagrams(diagram: number = 0) {
    Diagrams[ProjectSettings.selectedDiagram].json = saveDiagram();
    ProjectSettings.selectedDiagram = diagram;
    if (Object.keys(Diagrams[diagram].json).length > 0) {
        loadDiagram(Diagrams[diagram].json);
    } else graph.clear();
}

export function addDiagram() {
    Diagrams.push({name: Locale[ProjectSettings.viewLanguage].untitled, json: {}, active: true});
    for (let key of Object.keys(ProjectElements)) {
        ProjectElements[key].hidden[Diagrams.length - 1] = false;
        ProjectElements[key].position[Diagrams.length - 1] = {x: 0, y: 0};
    }
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
            labels: link.labels(),
            type: ProjectLinks[link.id].type
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
        vertices: joint.dia.Link.Vertex[];
        labels: joint.dia.Link.Label[];
        target: string;
        source: string;
        type: number;
    }[]
}) {
    graph.clear();
    for (let elem of load.elements) {
        let cls = new graphElement({id: elem.id});
        cls.prop({
            position: elem.pos,
            attrs: {
                label: {
                    text: elem.label
                }
            }
        });
        cls.addTo(graph);
        drawGraphElement(cls, ProjectSettings.selectedLanguage, ProjectSettings.representation);
    }
    for (let link of load.links) {
        let lnk = getNewLink(link.type, link.id);
        lnk.source({
            id: link.source,
            connectionPoint: {name: 'boundary', args: {selector: getElementShape(link.source)}}
        });
        lnk.target({
            id: link.target,
            connectionPoint: {name: 'boundary', args: {selector: getElementShape(link.target)}}
        });
        lnk.vertices(link.vertices);
        lnk.labels(link.labels);
        lnk.addTo(graph);
    }
}