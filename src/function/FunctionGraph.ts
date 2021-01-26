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
import {
    mergeTransactions,
    updateDeleteProjectLinkVertex,
    updateProjectElement,
    updateProjectElementDiagram,
    updateProjectLink
} from "../interface/TransactionInterface";
import {drawGraphElement} from "./FunctionDraw";


export const mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
export const mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";

export function nameGraphLink(cell: joint.dia.Link, languageCode: string) {
    if (typeof cell.id === "string" && ProjectLinks[cell.id].type === LinkType.DEFAULT) {
        let label = getLinkOrVocabElem(ProjectLinks[cell.id].iri).labels[languageCode];
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

export function spreadConnections(id: string, to: boolean = true) {
    let elem = graph.getElements().find(elem => elem.id === id);
    let transactions: { add: string[], delete: string[], update: string[] } = {
        add: [],
        delete: [],
        update: []
    }
    if (elem) {
        let centerX = elem.position().x + (elem.size().width / 2);
        let centerY = elem.position().y + (elem.size().height / 2);
        let elems = (to ?
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
        let radius = 200 + (elems.length * 50);
        for (let i = 0; i < elems.length; i++) {
            let elemID: string = elems[i];
            let x = centerX + radius * Math.cos((i * 2 * Math.PI) / elems.length);
            let y = centerY + radius * Math.sin((i * 2 * Math.PI) / elems.length);
            let newElem = new graphElement({id: elemID});
            newElem.position(x, y);
            let oldPos = _.cloneDeep(ProjectElements[elemID].position[ProjectSettings.selectedDiagram]);
            ProjectElements[elemID].position[ProjectSettings.selectedDiagram] = {x: x, y: y};
            ProjectElements[elemID].hidden[ProjectSettings.selectedDiagram] = false;
            newElem.addTo(graph);
            drawGraphElement(newElem, ProjectSettings.selectedLanguage, ProjectSettings.representation);
            transactions = mergeTransactions(transactions,
                restoreHiddenElem(elemID, newElem, false, true, false),
                updateProjectElement(VocabularyElements[ProjectElements[elemID].iri], elemID),
                updateProjectElementDiagram(elemID, ProjectSettings.selectedDiagram, oldPos, true));
        }
        if (ProjectSettings.representation === Representation.COMPACT)
            setRepresentation(ProjectSettings.representation);
    }
    return transactions;
}

export function setLabels(link: joint.dia.Link, centerLabel: string){
    link.labels([]);
    if (ProjectLinks[link.id].type === LinkType.DEFAULT) {
        link.appendLabel({
            attrs: {text: {text: centerLabel}},
            position: {distance: 0.5}
        });
        if (ProjectLinks[link.id].sourceCardinality.getString() !== "") {
            link.appendLabel({
                attrs: {text: {text: ProjectLinks[link.id].sourceCardinality.getString()}},
                position: {distance: 20}
            });
        }
        if (ProjectLinks[link.id].targetCardinality.getString() !== "") {
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

export function setRepresentation(representation: number): { result: boolean, transactions: { add: string[], delete: string[], update: string[] } } {
    let transactions: { add: string[], delete: string[], update: string[] } = {
        add: [],
        delete: [],
        update: []
    };
    if (representation === Representation.COMPACT) {
        let del = false;
        ProjectSettings.representation = Representation.COMPACT;
        ProjectSettings.selectedLink = "";
        for (let id of Object.keys(ProjectElements)) {
            if (
                VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
            ) {
                let connections: string[] = getActiveToConnections(id);
                if (connections.length > 1) {
                    let sourceLink: string | undefined = connections.find(src => ProjectLinks[src].iri === mvp1IRI);
                    let targetLink: string | undefined = connections.find(src => ProjectLinks[src].iri === mvp2IRI);
                    if (sourceLink && targetLink) {
                        let source = ProjectLinks[sourceLink].target;
                        let target = ProjectLinks[targetLink].target;
                        let sourceBox = graph.getElements().find(elem => elem.id === source);
                        let targetBox = graph.getElements().find(elem => elem.id === target);
                        let find = Object.keys(ProjectLinks).find(link => ProjectLinks[link].active &&
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
                                let coords = newLink.getSourcePoint();
                                let bbox = sourceBox.getBBox();
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
                                transactions = mergeTransactions(transactions, updateProjectLink(newLink.id));
                            }
                            setLabels(newLink, ProjectElements[id].selectedLabel[ProjectSettings.selectedLanguage] ||
                                VocabularyElements[ProjectElements[id].iri].labels[ProjectSettings.selectedLanguage]);
                        }
                    }
                }
                let cell = graph.getCell(id);
                if (cell) {
                    storeElement(cell);
                    del = true;
                }
            } else if (VocabularyElements[ProjectElements[id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))) {
                let cell = graph.getCell(id);
                if (cell) {
                    storeElement(cell);
                    del = true;
                }
            }
        }
        for (let link of graph.getLinks()) {
            if (ProjectLinks[link.id].iri in Links && Links[ProjectLinks[link.id].iri].type === LinkType.DEFAULT) {
                link.remove();
                del = true;
            }
        }
        return {result: del, transactions: transactions};
    } else {
        ProjectSettings.representation = Representation.FULL;
        ProjectSettings.selectedLink = "";
        for (let elem of ProjectSettings.switchElements) {
            if (ProjectElements[elem].position[ProjectSettings.selectedDiagram]) {
                let find = graph.getElements().find(cell => cell.id === elem &&
                    ProjectElements[elem].active && ProjectElements[elem].hidden[ProjectSettings.selectedDiagram]);
                let cell = find || new graphElement({id: elem})
                cell.addTo(graph);
                cell.position(ProjectElements[elem].position[ProjectSettings.selectedDiagram].x, ProjectElements[elem].position[ProjectSettings.selectedDiagram].y)
                ProjectElements[elem].hidden[ProjectSettings.selectedDiagram] = false;
                drawGraphElement(cell, ProjectSettings.selectedLanguage, representation);
                transactions = mergeTransactions(transactions, restoreHiddenElem(elem, cell, false, false, false));
            }
        }
        for (let elem of graph.getElements()) {
            drawGraphElement(elem, ProjectSettings.selectedLanguage, representation);
            if (typeof elem.id === "string") {
                transactions = mergeTransactions(transactions, restoreHiddenElem(elem.id, elem, true, true, false));
            }
        }
        for (let link of graph.getLinks()) {
            if (!(ProjectLinks[link.id].iri in Links) || (!(ProjectLinks[link.id].active))) {
                link.remove();
            }
        }
        ProjectSettings.switchElements = [];
        return {result: false, transactions: transactions};
    }
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
    if (ProjectLinks[link].source === ProjectLinks[link].target && (!(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]) ||
        ProjectLinks[link].vertices[ProjectSettings.selectedDiagram] === [])) {
        let coords = lnk.getSourcePoint();
        let bbox = lnk.getSourceCell()?.getBBox();
        if (bbox) {
            ProjectLinks[link].vertices[ProjectSettings.selectedDiagram] = [
                new joint.g.Point(coords.x, coords.y + 100),
                new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y + 100),
                new joint.g.Point(coords.x + (bbox.width / 2) + 50, coords.y),
            ]
        } else {
            ProjectLinks[link].vertices[ProjectSettings.selectedDiagram] = [
                new joint.g.Point(coords.x, coords.y + 100),
                new joint.g.Point(coords.x + 300, coords.y + 100),
                new joint.g.Point(coords.x + 300, coords.y),
            ]
        }
    }
    if (restoreConnectionPosition) {
        lnk.vertices(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]);
        return undefined;
    } else {
        let ret = _.cloneDeep(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]);
        ProjectLinks[link].vertices[ProjectSettings.selectedDiagram] = [];
        return ret ? ret.length : undefined;
    }
}

export function restoreHiddenElem(id: string, cls: joint.dia.Element, restoreSimpleConnectionPosition: boolean,
                                  restoreFull: boolean, restoreFullConnectionPosition: boolean):
    { add: string[], delete: string[], update: string[] } {
    let transactions: { add: string[], delete: string[], update: string[] } = {
        add: [],
        delete: [],
        update: []
    };
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
                transactions = mergeTransactions(transactions, updateDeleteProjectLinkVertex(link, 0, oldPos));
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
                        let sourcepos = graph.getCell(ProjectLinks[link].target).get('position');
                        let targetpos = graph.getCell(ProjectLinks[targetLink].target).get('position');
                        let posx = ((sourcepos.x + targetpos.x) / 2);
                        let posy = ((sourcepos.y + targetpos.y) / 2);
                        relationship.position(posx, posy);
                    }
                    let oldPos = _.cloneDeep(ProjectElements[relID].position[ProjectSettings.selectedDiagram]);
                    let oldHidden = _.cloneDeep(ProjectElements[relID].hidden[ProjectSettings.selectedDiagram]);
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
                    if (restoreFullConnectionPosition) {
                        domainLink.vertices(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]);
                        rangeLink.vertices(ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram]);
                    } else {
                        transactions = mergeTransactions(transactions,
                            updateProjectElement(VocabularyElements[ProjectElements[relID].iri], relID),
                            updateProjectElementDiagram(relID, ProjectSettings.selectedDiagram, oldPos, oldHidden));
                        if (ProjectLinks[link].vertices[ProjectSettings.selectedDiagram])
                            transactions = mergeTransactions(transactions, updateDeleteProjectLinkVertex(link, 0,
                                ProjectLinks[link].vertices[ProjectSettings.selectedDiagram].length));
                        if (ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram])
                            transactions = mergeTransactions(transactions, updateDeleteProjectLinkVertex(targetLink, 0,
                                ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram].length));
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
    return transactions;
}

