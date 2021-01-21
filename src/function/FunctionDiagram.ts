import {Diagrams, ProjectElements, ProjectSettings} from "../config/Variables";
import {graphElement} from "../graph/GraphElement";
import {graph} from "../graph/Graph";
import {drawGraphElement} from "./FunctionDraw";
import {restoreHiddenElem, setRepresentation} from "./FunctionGraph";
import {Representation} from "../config/Enum";
import {paper} from "../main/DiagramCanvas";
import {Locale} from "../config/Locale";
import * as _ from 'lodash';

export function changeDiagrams(diagram: number = 0) {
    graph.clear();
    ProjectSettings.selectedLink = "";
    if (Diagrams[diagram]) {
        ProjectSettings.selectedDiagram = diagram;
        ProjectSettings.selectedLink = "";
        for (let id in ProjectElements) {
            if (ProjectElements[id].hidden[diagram] === false && ProjectElements[id].position[diagram] && ProjectElements[id].active) {
                let cls = new graphElement({id: id});
                cls.position(ProjectElements[id].position[diagram].x, ProjectElements[id].position[diagram].y);
                cls.addTo(graph);
                drawGraphElement(cls, ProjectSettings.selectedLanguage, Representation.FULL);
                restoreHiddenElem(id, cls, true, false, false);
            }
        }
        if (ProjectSettings.representation === Representation.COMPACT)
            setRepresentation(ProjectSettings.representation);
        if (Diagrams[diagram].origin.x === 0 && Diagrams[diagram].origin.y === 0) {
            centerDiagram();
        } else {
            paper.scale(Diagrams[diagram].scale, Diagrams[diagram].scale);
            paper.translate(Diagrams[diagram].origin.x, Diagrams[diagram].origin.y);
        }
    }
}

export function addDiagram() {
    Diagrams.push({name: Locale[ProjectSettings.viewLanguage].untitled, active: true, scale: 1, origin: {x: 0, y: 0}});
    for (let key of Object.keys(ProjectElements)) {
        ProjectElements[key].hidden[Diagrams.length - 1] = false;
        ProjectElements[key].position[Diagrams.length - 1] = {x: 0, y: 0};
    }
}

export function centerDiagram() {
    paper.translate(0, 0);
    let x = 0;
    let y = 0;
    let scale = paper.scale().sx
    for (let elem of graph.getElements()) {
        x += elem.getBBox().x;
        y += elem.getBBox().y;
    }
    paper.translate(-(x / graph.getElements().length * scale) + (paper.getComputedSize().width / 2),
        -(y / graph.getElements().length * scale) + (paper.getComputedSize().height / 2));
    Diagrams[ProjectSettings.selectedDiagram].origin = {
        x: -(x / graph.getElements().length * scale) + (paper.getComputedSize().width / 2),
        y: -(y / graph.getElements().length * scale) + (paper.getComputedSize().height / 2)
    };
}

export function zoomDiagram(x: number, y: number, delta: number) {
    let oldTranslate = paper.translate();
    let oldScale = paper.scale().sx;
    let nextScale = delta === 0 ? 1 : _.round((delta * 0.1) + oldScale, 1);
    if (nextScale >= 0.1 && nextScale <= 2.1) {
        paper.translate(oldTranslate.tx + (x * (oldScale - nextScale)),
            oldTranslate.ty + (y * (oldScale - nextScale)));
        paper.scale(nextScale, nextScale);
        Diagrams[ProjectSettings.selectedDiagram].origin = {
            x: oldTranslate.tx + (x * (oldScale - nextScale)),
            y: oldTranslate.ty + (y * (oldScale - nextScale))
        };
        Diagrams[ProjectSettings.selectedDiagram].scale = nextScale;
    }
}