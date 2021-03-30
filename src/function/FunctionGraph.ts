import {Links, ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {parsePrefix} from "./FunctionEditVars";
import {graph} from "../graph/Graph";
import {getActiveToConnections, getElementShape, getLinkOrVocabElem, getNewLink} from "./FunctionGetVars";
import * as joint from "jointjs";
import * as _ from "lodash";
import {graphElement} from "../graph/GraphElement";
import {addLink} from "./FunctionCreateVars";
import {Cardinality} from "../datatypes/Cardinality";
import {LinkType, Representation} from "../config/Enum";
import {drawGraphElement} from "./FunctionDraw";
import {updateDeleteProjectLinkVertex, updateProjectLink} from "../queries/UpdateLinkQueries";
import {updateProjectElement, updateProjectElementDiagram} from "../queries/UpdateElementQueries";


export const mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
export const mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";

export function nameGraphLink(cell: joint.dia.Link, languageCode: string) {
    if (typeof cell.id === "string" && ProjectLinks[cell.id].type === LinkType.DEFAULT) {
        const label = getLinkOrVocabElem(ProjectLinks[cell.id].iri).labels[languageCode];
        if (label) {
            let labels = cell.labels()
            labels.forEach((linkLabel, i) => {
                if (!linkLabel.attrs?.text?.text?.match(/^\d|\*/)) {
                    cell.label(i, {
                        attrs: {
                            text: {
                                text: label
                            }
                        },
                        position: {
                            distance: 0.5
                        }
                    });
                }
            })
        }
    }
}

export function spreadConnections(id: string, to: boolean = true): string[] {
    const elem = graph.getElements().find(elem => elem.id === id);
    let queries: string[] = [];
    if (elem) {
        const centerX = elem.position().x + (elem.size().width / 2);
        const centerY = elem.position().y + (elem.size().height / 2);
        const elems = (to ?
            ProjectElements[id].connections.filter(conn => ProjectLinks[conn].active &&
                !(graph.getCell(ProjectLinks[conn].target)) &&
                (ProjectSettings.representation === Representation.FULL ? ProjectLinks[conn].iri in Links : (!(ProjectLinks[conn].iri in Links) ||
                    (ProjectLinks[conn].iri in Links && Links[ProjectLinks[conn].iri].inScheme.startsWith(ProjectSettings.ontographerContext)))))
                .map(conn => ProjectLinks[conn].target) :
            Object.keys(ProjectLinks).filter(conn => ProjectLinks[conn].active &&
                (ProjectSettings.representation === Representation.FULL ? ProjectLinks[conn].iri in Links : (!(ProjectLinks[conn].iri in Links) ||
                    (ProjectLinks[conn].iri in Links && Links[ProjectLinks[conn].iri].inScheme.startsWith(ProjectSettings.ontographerContext)))) &&
                ProjectLinks[conn].target === id &&
                !(graph.getCell(ProjectLinks[conn].source)))
                .map(conn => ProjectLinks[conn].source));
        const radius = 200 + (elems.length * 50);
        for (let i = 0; i < elems.length; i++) {
            const elemID: string = elems[i];
            const x = centerX + radius * Math.cos((i * 2 * Math.PI) / elems.length);
            const y = centerY + radius * Math.sin((i * 2 * Math.PI) / elems.length);
            let newElem = new graphElement({id: elemID});
            newElem.position(x, y);
            ProjectElements[elemID].position[ProjectSettings.selectedDiagram] = {x: x, y: y};
            ProjectElements[elemID].hidden[ProjectSettings.selectedDiagram] = false;
            newElem.addTo(graph);
            drawGraphElement(newElem, ProjectSettings.selectedLanguage, ProjectSettings.representation);
            queries.push(
                ...restoreHiddenElem(elemID, newElem, false, true, false),
                updateProjectElement(true, elemID),
                updateProjectElementDiagram(ProjectSettings.selectedDiagram, elemID));
        }
        if (ProjectSettings.representation === Representation.COMPACT)
            setRepresentation(ProjectSettings.representation);
    }
    return queries;
}

export function setLabels(link: joint.dia.Link, centerLabel: string){
    link.labels([]);
    if (ProjectLinks[link.id].type === LinkType.DEFAULT) {
        link.appendLabel({
            attrs: {text: {text: centerLabel}},
            position: {distance: 0.5}
        });
        if (ProjectLinks[link.id].sourceCardinality && ProjectLinks[link.id].sourceCardinality.getString() !== "") {
            link.appendLabel({
                attrs: {text: {text: ProjectLinks[link.id].sourceCardinality.getString()}},
                position: {distance: 20}
            });
        }
        if (ProjectLinks[link.id].targetCardinality && ProjectLinks[link.id].targetCardinality.getString() !== "") {
            link.appendLabel({
                attrs: {text: {text: ProjectLinks[link.id].targetCardinality.getString()}},
                position: {distance: -20}
            });
        }
    }
}

function storeElement(elem: joint.dia.Cell) {
    ProjectElements[elem.id].hidden[ProjectSettings.selectedDiagram] = true;
    elem.remove();
    if (typeof elem.id === "string") {
        ProjectSettings.switchElements.push(elem.id);
    }
}

export function setRepresentation(representation: number): { result: boolean, transaction: string[] } {
    let queries: string[] = [];
    if (representation === Representation.COMPACT) {
        let del = false;
        ProjectSettings.representation = Representation.COMPACT;
        ProjectSettings.selectedLink = "";
        for (const id of Object.keys(ProjectElements)) {
            if (
                VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
            ) {
                let connections: string[] = getActiveToConnections(id);
                if (connections.length > 1) {
                    const sourceLink: string | undefined = connections.find(src => ProjectLinks[src].iri === mvp1IRI);
                    const targetLink: string | undefined = connections.find(src => ProjectLinks[src].iri === mvp2IRI);
                    if (sourceLink && targetLink) {
                        const source = ProjectLinks[sourceLink].target;
                        const target = ProjectLinks[targetLink].target;
                        const sourceBox = graph.getElements().find(elem => elem.id === source);
                        const targetBox = graph.getElements().find(elem => elem.id === target);
                        const find = Object.keys(ProjectLinks).find(link => ProjectLinks[link].active &&
                            ProjectLinks[link].iri === ProjectElements[id].iri &&
                            ProjectLinks[link].source === source && ProjectLinks[link].target === target
                        )
                        let newLink = typeof find === "string" ? getNewLink(LinkType.DEFAULT, find) : getNewLink();
                        if (typeof newLink.id === "string" && sourceBox && targetBox) {
                            newLink.source({
                                id: source,
                                connectionPoint: {name: 'boundary', args: {selector: getElementShape(source)}}
                            });
                            newLink.target({
                                id: target,
                                connectionPoint: {name: 'boundary', args: {selector: getElementShape(target)}}
                            });
                            newLink.addTo(graph);
                            if (!(newLink.id in ProjectLinks))
                                addLink(newLink.id, ProjectElements[id].iri, source, target);
                            if (ProjectLinks[newLink.id].vertices[ProjectSettings.selectedDiagram])
                                newLink.vertices(ProjectLinks[newLink.id].vertices[ProjectSettings.selectedDiagram]);
                            else if (source === target) {
                                const coords = newLink.getSourcePoint();
                                const bbox = sourceBox.getBBox();
                                if (bbox) {
                                    newLink.vertices([
                                        new joint.g.Point(coords.x, coords.y + 100),
                                        new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y + 100),
                                        new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y),
                                    ])
                                } else {
                                    newLink.vertices([
                                        new joint.g.Point(coords.x, coords.y + 100),
                                        new joint.g.Point(coords.x + 300, coords.y + 100),
                                        new joint.g.Point(coords.x + 300, coords.y),
                                    ])
                                }
                            }
                            ProjectLinks[newLink.id].vertices[ProjectSettings.selectedDiagram] = newLink.vertices();
                            if (!find) {
                                ProjectLinks[newLink.id].sourceCardinality =
                                    new Cardinality(
                                        ProjectLinks[sourceLink].targetCardinality.getFirstCardinality(),
                                        ProjectLinks[sourceLink].targetCardinality.getSecondCardinality());
                                ProjectLinks[newLink.id].targetCardinality =
                                    new Cardinality(
                                        ProjectLinks[sourceLink].sourceCardinality.getFirstCardinality(),
                                        ProjectLinks[sourceLink].sourceCardinality.getSecondCardinality());
                                queries.push(updateProjectLink(false, newLink.id));
                            }
                            setLabels(newLink, ProjectElements[id].selectedLabel[ProjectSettings.selectedLanguage] ||
                                VocabularyElements[ProjectElements[id].iri].labels[ProjectSettings.selectedLanguage]);
                        }
                    }
                }
                const cell = graph.getCell(id);
                if (cell) {
                    storeElement(cell);
                    del = true;
                }
            } else if (VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))) {
                const cell = graph.getCell(id);
                if (cell) {
                    storeElement(cell);
                    del = true;
                }
            }
        }
        for (const link of graph.getLinks()) {
            if (ProjectLinks[link.id].iri in Links && Links[ProjectLinks[link.id].iri].type === LinkType.DEFAULT) {
                link.remove();
                del = true;
            }
        }
        return {result: del, transaction: queries};
    } else {
        ProjectSettings.representation = Representation.FULL;
        ProjectSettings.selectedLink = "";
        for (const elem of ProjectSettings.switchElements) {
            if (ProjectElements[elem].position[ProjectSettings.selectedDiagram]) {
                const find = graph.getElements().find(cell => cell.id === elem &&
                    ProjectElements[elem].active && ProjectElements[elem].hidden[ProjectSettings.selectedDiagram]);
                let cell = find || new graphElement({id: elem})
                cell.addTo(graph);
                cell.position(ProjectElements[elem].position[ProjectSettings.selectedDiagram].x, ProjectElements[elem].position[ProjectSettings.selectedDiagram].y)
                ProjectElements[elem].hidden[ProjectSettings.selectedDiagram] = false;
                drawGraphElement(cell, ProjectSettings.selectedLanguage, representation);
                queries.push(...restoreHiddenElem(elem, cell, false, false, false));
            }
        }
        for (let elem of graph.getElements()) {
            drawGraphElement(elem, ProjectSettings.selectedLanguage, representation);
            if (typeof elem.id === "string") {
                queries.push(...restoreHiddenElem(elem.id, elem, true, true, false));
            }
        }
        for (let link of graph.getLinks()) {
            if (!(ProjectLinks[link.id].iri in Links) || (!(ProjectLinks[link.id].active))) {
                link.remove();
            }
        }
        ProjectSettings.switchElements = [];
        return {result: false, transaction: queries};
    }
}

export function checkLinkSelfLoop(link: joint.dia.Link) {
    const id = link.id as string;
    if (ProjectLinks[id].source === ProjectLinks[id].target &&
        (!(ProjectLinks[id].vertices[ProjectSettings.selectedDiagram]) ||
            ProjectLinks[id].vertices[ProjectSettings.selectedDiagram].length === 0)) {
        const coords = link.getSourcePoint();
        const bbox = link.getSourceCell()?.getBBox();
        if (bbox) {
            return [
                new joint.g.Point(coords.x, coords.y + 100),
                new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y + 100),
                new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y),
            ]
        } else {
            return [
                new joint.g.Point(coords.x, coords.y + 100),
                new joint.g.Point(coords.x + 300, coords.y + 100),
                new joint.g.Point(coords.x + 300, coords.y),
            ]
        }
    } else return [];
}

export function setupLink(link: string, restoreConnectionPosition: boolean = true) {
    let lnk = getNewLink(ProjectLinks[link].type, link);
    setLabels(lnk, getLinkOrVocabElem(ProjectLinks[link].iri).labels[ProjectSettings.selectedLanguage])
    lnk.source({
        id: ProjectLinks[link].source,
        connectionPoint: {name: 'boundary', args: {selector: getElementShape(ProjectLinks[link].source)}}
    });
    lnk.target({
        id: ProjectLinks[link].target,
        connectionPoint: {name: 'boundary', args: {selector: getElementShape(ProjectLinks[link].target)}}
    });
    lnk.addTo(graph);
    if (!(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]))
        ProjectLinks[link].vertices[ProjectSettings.selectedDiagram] = [];
    if (restoreConnectionPosition) {
        lnk.vertices(
            ProjectLinks[link].vertices[ProjectSettings.selectedDiagram].length > 0 ?
                ProjectLinks[link].vertices[ProjectSettings.selectedDiagram] : checkLinkSelfLoop(lnk));
        return undefined;
    } else {
        let ret = _.cloneDeep(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]);
        ProjectLinks[link].vertices[ProjectSettings.selectedDiagram] = checkLinkSelfLoop(lnk);
        if (ProjectLinks[link].vertices[ProjectSettings.selectedDiagram].length > 0)
            lnk.vertices(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]);
        return ret ? ret.length : undefined;
    }
}

export function restoreHiddenElem(id: string, cls: joint.dia.Element, restoreSimpleConnectionPosition: boolean,
                                  restoreFull: boolean, restoreFullConnectionPosition: boolean): string[] {
    let queries: string[] = [];
    if (!(ProjectElements[id].diagrams.includes(ProjectSettings.selectedDiagram))) {
        ProjectElements[id].diagrams.push(ProjectSettings.selectedDiagram)
    }
    for (let link of Object.keys(ProjectLinks).filter(link => ProjectLinks[link].active)) {
        if ((ProjectLinks[link].source === id || ProjectLinks[link].target === id)
            && (graph.getCell(ProjectLinks[link].source) && graph.getCell(ProjectLinks[link].target)) && (
                (ProjectSettings.representation === Representation.FULL ? ProjectLinks[link].iri in Links : (!(ProjectLinks[link].iri in Links) ||
                        (ProjectLinks[link].iri in Links && Links[ProjectLinks[link].iri].inScheme.startsWith(ProjectSettings.ontographerContext)))
                ))) {
            let oldPos = setupLink(link, restoreSimpleConnectionPosition);
            if (oldPos)
                queries.push(updateDeleteProjectLinkVertex(link, 0, oldPos, ProjectSettings.selectedDiagram));
        } else if (restoreFull && ProjectSettings.representation === Representation.FULL &&
            ProjectLinks[link].target === id &&
            ProjectLinks[link].iri in Links &&
            graph.getCell(ProjectLinks[link].target)) {
            let relID = ProjectLinks[link].source;
            for (let targetLink in ProjectLinks) {
                if (ProjectLinks[targetLink].active &&
                    ProjectLinks[targetLink].source === relID &&
                    ProjectLinks[targetLink].target !== id &&
                    graph.getCell(ProjectLinks[targetLink].target)) {
                    let domainLink = getNewLink(ProjectLinks[link].type, link);
                    let rangeLink = getNewLink(ProjectLinks[targetLink].type, targetLink);
                    let existingRel = graph.getElements().find(elem => elem.id === relID);
                    let relationship = existingRel ? existingRel : new graphElement({id: relID});
                    if (ProjectElements[relID].position[ProjectSettings.selectedDiagram] &&
                        ProjectElements[relID].position[ProjectSettings.selectedDiagram].x !== 0 &&
                        ProjectElements[relID].position[ProjectSettings.selectedDiagram].y !== 0 &&
                        restoreFullConnectionPosition) {
                        relationship.position(ProjectElements[relID].position[ProjectSettings.selectedDiagram].x,
                            ProjectElements[relID].position[ProjectSettings.selectedDiagram].y);
                    } else {
                        const sourcepos = graph.getCell(ProjectLinks[link].target).get('position');
                        const targetpos = graph.getCell(ProjectLinks[targetLink].target).get('position');
                        const posx = ((sourcepos.x + targetpos.x) / 2);
                        const posy = ((sourcepos.y + targetpos.y) / 2);
                        relationship.position(posx, posy);
                    }
                    ProjectElements[relID].position[ProjectSettings.selectedDiagram] = relationship.position();
                    ProjectElements[relID].hidden[ProjectSettings.selectedDiagram] = false;
                    drawGraphElement(relationship, ProjectSettings.selectedLanguage, Representation.FULL);
                    domainLink.source({
                        id: relID,
                        connectionPoint: {name: 'boundary', args: {selector: getElementShape(relID)}}
                    });
                    domainLink.target({
                        id: ProjectLinks[link].target,
                        connectionPoint: {
                            name: 'boundary',
                            args: {selector: getElementShape(ProjectLinks[link].target)}
                        }
                    });
                    rangeLink.source({
                        id: relID,
                        connectionPoint: {name: 'boundary', args: {selector: getElementShape(relID)}}
                    });
                    rangeLink.target({
                        id: ProjectLinks[targetLink].target,
                        connectionPoint: {
                            name: 'boundary',
                            args: {selector: getElementShape(ProjectLinks[targetLink].target)}
                        }
                    });
                    setLabels(domainLink, getLinkOrVocabElem(ProjectLinks[link].iri).labels[ProjectSettings.selectedLanguage]);
                    setLabels(rangeLink, getLinkOrVocabElem(ProjectLinks[targetLink].iri).labels[ProjectSettings.selectedLanguage]);
                    relationship.addTo(graph);
                    queries.push(updateProjectElementDiagram(ProjectSettings.selectedDiagram, relID));
                    if (restoreFullConnectionPosition) {
                        domainLink.vertices(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]);
                        rangeLink.vertices(ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram]);
                    } else {
                        queries.push(updateProjectElement(true, relID));
                        if (ProjectLinks[link].vertices[ProjectSettings.selectedDiagram])
                            queries.push(updateDeleteProjectLinkVertex(link, 0,
                                ProjectLinks[link].vertices[ProjectSettings.selectedDiagram].length,
                                ProjectSettings.selectedDiagram));
                        if (ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram])
                            queries.push(updateDeleteProjectLinkVertex(targetLink, 0,
                                ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram].length,
                                ProjectSettings.selectedDiagram));
                        ProjectLinks[link].vertices[ProjectSettings.selectedDiagram] = [];
                        ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram] = [];
                    }
                    domainLink.addTo(graph);
                    rangeLink.addTo(graph);
                    break;
                }
            }
        }
    }
    return queries;
}

