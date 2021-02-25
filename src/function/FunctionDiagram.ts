import {Diagrams, ProjectElements, ProjectLinks, ProjectSettings} from "../config/Variables";
import {graphElement} from "../graph/GraphElement";
import {graph} from "../graph/Graph";
import {drawGraphElement, highlightCell, unHighlightCell, unHighlightSelected} from "./FunctionDraw";
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
        for (const id in ProjectElements) {
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

export function addDiagram(): number {
    const index = Diagrams.length;
    Diagrams.push({name: Locale[ProjectSettings.viewLanguage].untitled, active: true, scale: 1, origin: {x: 0, y: 0}})
    for (const key of Object.keys(ProjectElements)) {
        ProjectElements[key].hidden[index] = true;
        ProjectElements[key].position[index] = {x: 0, y: 0};
    }
    Object.keys(ProjectLinks).forEach(link => ProjectLinks[link].vertices[index] = []);
    return index;
}

export function centerDiagram() {
    paper.translate(0, 0);
    let x = 0;
    let y = 0;
    const scale = paper.scale().sx
    for (const elem of graph.getElements()) {
        x += elem.getBBox().x;
        y += elem.getBBox().y;
    }
    paper.translate(-(x / graph.getElements().length * scale) + (paper.getComputedSize().width / 2),
        -(y / graph.getElements().length * scale) + (paper.getComputedSize().height / 2));
    updateDiagramPosition(ProjectSettings.selectedDiagram);
}

export function zoomDiagram(x: number, y: number, delta: number) {
    const oldTranslate = paper.translate();
    const oldScale = paper.scale().sx;
    const nextScale = delta === 0 ? 1 : _.round((delta * 0.1) + oldScale, 1);
    if (nextScale >= 0.1 && nextScale <= 2.1) {
        paper.translate(oldTranslate.tx + (x * (oldScale - nextScale)),
            oldTranslate.ty + (y * (oldScale - nextScale)));
        paper.scale(nextScale, nextScale);
        updateDiagramPosition(ProjectSettings.selectedDiagram);
    }
}

/**
 * Saves the diagram position and scale information.
 * @param diagram The diagram to be updated
 */
export function updateDiagramPosition(diagram: number) {
    Diagrams[diagram].origin = {
        x: paper.translate().tx,
        y: paper.translate().ty
    };
    Diagrams[diagram].scale = paper.scale().sx;
}

/**
 *  Resets the diagram's selections (deselects the link and/or the elements selected).
 */
export function resetDiagramSelection() {
    unHighlightCell(ProjectSettings.selectedLink);
    unHighlightSelected(ProjectSettings.selectedElements);
    ProjectSettings.selectedLink = "";
    ProjectSettings.selectedElements = [];
}

/**
 * Higlights the element (colors the border of it and adds it to the list of selected elements).
 * @param id ID of the element to highlight
 * @param color (optional) Color with which to paint the border of the element
 */
export function highlightElement(id: string, color?: string) {
    if (!(ProjectSettings.selectedElements.includes(id)))
        ProjectSettings.selectedElements.push(id);
    highlightCell(id, color);
}

/**
 * Unhighlights the element (restores the original border color and removes it from the list of selected elements).
 * @param id ID of the element to unhighlight
 */
export function unhighlightElement(id: string) {
    const index = ProjectSettings.selectedElements.indexOf(id);
    if (index !== -1) ProjectSettings.selectedElements.splice(index, 1);
    unHighlightCell(id);
}
