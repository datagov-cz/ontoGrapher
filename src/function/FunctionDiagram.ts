import {Diagrams, ProjectElements, ProjectSettings} from "../config/Variables";
import {graphElement} from "../graph/GraphElement";
import {graph} from "../graph/Graph";
import {Locale} from "../config/Locale";
import {drawGraphElement} from "./FunctionDraw";
import {restoreHiddenElem, setRepresentation} from "./FunctionGraph";
import {Representation} from "../config/Enum";
import {paper} from "../main/DiagramCanvas";

export function changeDiagrams(diagram: number = 0) {
    Diagrams[ProjectSettings.selectedDiagram].json = saveDiagram();
    ProjectSettings.selectedDiagram = diagram;
    if (Object.keys(Diagrams[diagram].json).length > 0) {
        loadDiagram(Diagrams[diagram].json);
    } else graph.clear();
    paper.translate(0, 0);
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
    for (let cell of cells) {
        if (!(cell.isLink())) {
            elements.push({
                id: cell.id,
                pos: cell.get('position'),
                label: cell.attr('label/text')
            });
        }
    }
    return {elements: elements}
}

export function loadDiagram(load: {
    elements: {
        id: any;
        label: any;
        pos: any;
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
        restoreHiddenElem(elem.id, cls, true, false, false);
    }
    if (ProjectSettings.representation === Representation.COMPACT)
        setRepresentation(ProjectSettings.representation);
}