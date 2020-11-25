import {Links, ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {getName, getStereotypeList, parsePrefix, setElementShape} from "./FunctionEditVars";
import {graph} from "../graph/Graph";
import {getLinkOrVocabElem, isConnectionWithTrope} from "./FunctionGetVars";
import * as joint from "jointjs";
import * as LocaleMain from "../locale/LocaleMain.json";
import {graphElement} from "../graph/GraphElement";
import {LinkConfig} from "../config/LinkConfig";
import {addLink} from "./FunctionCreateVars";
import {Cardinality} from "../datatypes/Cardinality";
import {LinkType, Representation} from "../config/Enum";
import {
    updateDeleteProjectLinkVertex,
    updateProjectElementDiagram,
    updateProjectLink
} from "../interface/TransactionInterface";
import {Shapes} from "../config/Shapes";


let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";

export function drawGraphElement(elem: joint.dia.Element, languageCode: string, representation: number) {
    if (typeof elem.id === "string") {
        let types = VocabularyElements[ProjectElements[elem.id].iri].types;
        let label = VocabularyElements[ProjectElements[elem.id].iri].labels[languageCode];
        let labels: string[] = [];
        if (ProjectSettings.viewStereotypes)
            getStereotypeList(types, languageCode).forEach((str) => labels.push("«" + str.toLowerCase() + "»"));
        labels.push(label === "" ? "<blank>" : label);
        elem.prop('attrs/label/text', labels.join("\n"));
        let text = [];
        if (representation === Representation.COMPACT) {
            for (let link in ProjectLinks) {
                if ((ProjectLinks[link].source === elem.id || ProjectLinks[link].target === elem.id) &&
                    ProjectLinks[link].active) {
                    if (ProjectLinks[link].iri === parsePrefix("z-sgov-pojem", "má-vlastnost") &&
                        ProjectLinks[link].source === elem.id && ProjectLinks[link].active) {
                        text.push(VocabularyElements[ProjectElements[ProjectLinks[link].target].iri].labels[languageCode])
                    } else if (ProjectLinks[link].iri === parsePrefix("z-sgov-pojem", "je-vlastností") &&
                        ProjectLinks[link].target === elem.id && ProjectLinks[link].active) {
                        text.push(VocabularyElements[ProjectElements[ProjectLinks[link].source].iri].labels[languageCode])
                    }
                }
            }
        }
        elem.prop("attrs/labelAttrs/text", text.join("\n"));
        let width = representation === Representation.COMPACT ?
            Math.max((labels.reduce((a, b) => a.length > b.length ? a : b, "").length * 10) + 4,
                text.length > 0 ? 8 * (text.reduce((a, b) => a.length > b.length ? a : b, "").length) : 0) :
            (labels.reduce((a, b) => a.length > b.length ? a : b, "").length * 10) + 4;
        elem.prop('attrs/text/x', width / 2);
        let attrHeight = (24 + ((labels.length - 1) * 18));
        let height = (text.length > 0 ? (4 + (text.length * 14)) : 0) +
            attrHeight;
        elem.prop('attrs/labelAttrs/y', attrHeight);
        setElementShape(elem, width, height);
        elem.resize(width, height);
    }
}

export function getNewLink(type?: number, id?: string): joint.dia.Link {
    let link = new joint.shapes.standard.Link({id: id});
    if (type && type in LinkConfig) {
        link = LinkConfig[type].newLink(id);
    }
    return link;
}

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

export function getFullConnections(id: string): string[] {
    return Object.keys(ProjectElements).filter(elem => ProjectElements[elem].active &&
        parsePrefix("z-sgov-pojem", "typ-vztahu") === ProjectElements[elem].iri &&
        ProjectElements[elem].connections.find(link => ProjectLinks[link].active &&
            (ProjectLinks[link].iri === mvp1IRI || ProjectLinks[link].iri === mvp2IRI) &&
            ProjectLinks[link].target === id));
}

export function spreadConnections(id: string, limitToTropes: boolean, representation: boolean = true) {
    let elem = graph.getElements().find(elem => elem.id === id);
    if (elem) {
        let centerX = elem.position().x + (elem.size().width / 2);
        let centerY = elem.position().y + (elem.size().height / 2);
        let elems =
            ProjectElements[id].connections.filter(conn => ProjectLinks[conn].active &&
                (limitToTropes ? isConnectionWithTrope(conn, id) : true))
                .map(conn => ProjectLinks[conn].target);
        let radius = 200 + (elems.length * 50);
        for (let i = 0; i < elems.length; i++) {
            let elemID: string = elems[i];
            let x = centerX + radius * Math.cos((i * 2 * Math.PI) / elems.length);
            let y = centerY + radius * Math.sin((i * 2 * Math.PI) / elems.length);
            let find = graph.getElements().find(elem => elem.id === elemID);
            let elem = find ? find : new graphElement({id: elemID});
            if (!limitToTropes) elem.addTo(graph);
            if (!find) elem.position(x, y);
            ProjectElements[elemID].position[ProjectSettings.selectedDiagram] = {x: x, y: y};
            ProjectElements[elemID].hidden[ProjectSettings.selectedDiagram] = false;
            drawGraphElement(elem, ProjectSettings.selectedLanguage, ProjectSettings.representation);
            restoreHiddenElem(id, elem, true);
            updateProjectElementDiagram(ProjectSettings.contextEndpoint,
                elemID, ProjectSettings.selectedDiagram);
        }
    }
    if (representation) setRepresentation(ProjectSettings.representation, false);
}

export function getUnderlyingFullConnections(link: joint.dia.Link): { src: string, tgt: string } | undefined {
    let id = link.id;
    let iri = ProjectLinks[id].iri;
    if (!(iri in VocabularyElements)) return;
    let sourceElem = link.getSourceCell()?.id;
    let targetElem = link.getTargetCell()?.id;
    if (sourceElem && targetElem) {
        let preds = Object.keys(ProjectElements).filter(id => ProjectElements[id].iri === iri);
        for (let pred of preds) {
            let sourceLink = Object.keys(ProjectLinks).find(id =>
                ProjectElements[pred].connections.includes(id) &&
                ProjectLinks[id].iri === mvp1IRI &&
                ProjectLinks[id].target === sourceElem &&
                ProjectLinks[id].active
            );
            let targetLink = Object.keys(ProjectLinks).find(id =>
                ProjectElements[pred].connections.includes(id) &&
                ProjectLinks[id].iri === mvp2IRI &&
                ProjectLinks[id].target === targetElem &&
                ProjectLinks[id].active
            );
            if (sourceLink && targetLink) return {src: sourceLink, tgt: targetLink};
        }
        return;
    }
}

export function setLabels(link: joint.dia.Link, centerLabel: string){
    link.labels([]);
    if (ProjectLinks[link.id].type === LinkType.DEFAULT) {
        link.appendLabel({
            attrs: {text: {text: centerLabel}},
            position: {distance: 0.5}
        });
        if (ProjectLinks[link.id].sourceCardinality.getString() !== LocaleMain.none) {
            link.appendLabel({
                attrs: {text: {text: ProjectLinks[link.id].sourceCardinality.getString()}},
                position: {distance: 20}
            });
        }
        if (ProjectLinks[link.id].targetCardinality.getString() !== LocaleMain.none) {
            link.appendLabel({
                attrs: {text: {text: ProjectLinks[link.id].targetCardinality.getString()}},
                position: {distance: -20}
            });
        }
    }
}

function storeElement(elem: joint.dia.Element) {
    ProjectElements[elem.id].hidden[ProjectSettings.selectedDiagram] = true;
    elem.remove();
    if (typeof elem.id === "string") {
        ProjectSettings.switchElements.push(elem.id);
    }
}

export function setRepresentation(representation: number, spread: boolean = true) {
    if (representation === Representation.COMPACT) {
        let del = false;
        ProjectSettings.representation = Representation.COMPACT;
        ProjectSettings.selectedLink = "";
        for (let elem of graph.getElements()) {
            drawGraphElement(elem, ProjectSettings.selectedLanguage, representation);
            if (
                VocabularyElements[ProjectElements[elem.id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
            ) {
                if (graph.getConnectedLinks(elem).length > 1) {
                    let sourceLink = graph.getConnectedLinks(elem).find(src => ProjectLinks[src.id].iri === mvp1IRI);
                    let targetLink = graph.getConnectedLinks(elem).find(src => ProjectLinks[src.id].iri === mvp2IRI);
                    if (sourceLink && targetLink) {
                        let source = sourceLink.getTargetCell()?.id;
                        let target = targetLink.getTargetCell()?.id;
                        if (typeof source === "string" && typeof target === "string") {
                            let find = Object.keys(ProjectLinks).find(link => ProjectLinks[link].active &&
                                ProjectLinks[link].iri === ProjectElements[elem.id].iri &&
                                ProjectLinks[link].source === source && ProjectLinks[link].target === target
                            )
                            if (typeof find === "string") {
                                let newLink = getNewLink(LinkType.DEFAULT, find);
                                newLink.source({
                                    id: source,
                                    connectionPoint: {name: 'boundary', args: {selector: getElementShape(source)}}
                                });
                                newLink.target({
                                    id: target,
                                    connectionPoint: {name: 'boundary', args: {selector: getElementShape(target)}}
                                });
                                newLink.addTo(graph);
                                if (ProjectLinks[newLink.id].vertices[ProjectSettings.selectedDiagram])
                                    newLink.vertices(ProjectLinks[newLink.id].vertices[ProjectSettings.selectedDiagram]);
                                else if (source === target) {
                                    let coords = newLink.getSourcePoint();
                                    let bbox = sourceLink.getSourceCell()?.getBBox();
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
                                setLabels(newLink, VocabularyElements[ProjectElements[elem.id].iri].labels[ProjectSettings.selectedLanguage]);
                            } else {
                                let newLink = getNewLink();
                                newLink.source({
                                    id: source,
                                    connectionPoint: {name: 'boundary', args: {selector: getElementShape(source)}}
                                });
                                newLink.target({
                                    id: target,
                                    connectionPoint: {name: 'boundary', args: {selector: getElementShape(target)}}
                                });
                                if (typeof newLink.id === "string") {
                                    addLink(newLink.id, ProjectElements[elem.id].iri, source, target);
                                    newLink.addTo(graph);
                                    if (source === target) {
                                        let coords = newLink.getSourcePoint();
                                        let bbox = sourceLink.getSourceCell()?.getBBox();
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
                                    ProjectLinks[newLink.id].sourceCardinality =
                                        new Cardinality(
                                            ProjectLinks[sourceLink.id].targetCardinality.getFirstCardinality(),
                                            ProjectLinks[sourceLink.id].targetCardinality.getSecondCardinality());
                                    ProjectLinks[newLink.id].targetCardinality =
                                        new Cardinality(
                                            ProjectLinks[sourceLink.id].sourceCardinality.getFirstCardinality(),
                                            ProjectLinks[sourceLink.id].sourceCardinality.getSecondCardinality());
                                    ProjectLinks[newLink.id].vertices[ProjectSettings.selectedDiagram] = newLink.vertices();
                                    setLabels(newLink, VocabularyElements[ProjectElements[elem.id].iri].labels[ProjectSettings.selectedLanguage]);
                                    updateProjectLink(ProjectSettings.contextEndpoint, newLink.id);
                                }
                            }
                        }
                        sourceLink.remove();
                        targetLink.remove();
                    }
                }
                if (graph.getConnectedLinks(elem).length < 2) {
                    storeElement(elem);
                    del = true;
                }
            } else if (VocabularyElements[ProjectElements[elem.id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))) {
                storeElement(elem);
                del = true;
            }
        }
        for (let link of graph.getLinks()) {
            if (ProjectLinks[link.id].iri in Links && Links[ProjectLinks[link.id].iri].type === LinkType.DEFAULT) {
                link.remove();
                del = true;
            }
        }
        return del;
    } else if (representation === Representation.FULL) {
        ProjectSettings.representation = Representation.FULL;
        ProjectSettings.selectedLink = "";
        for (let elem of ProjectSettings.switchElements) {
            if (ProjectElements[elem].position[ProjectSettings.selectedDiagram] &&
                !(VocabularyElements[ProjectElements[elem].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu")))) {
                let find = graph.getElements().find(cell => cell.id === elem &&
                    ProjectElements[elem].active && ProjectElements[elem].hidden[ProjectSettings.selectedDiagram]);
                let cell = find || new graphElement({id: elem})
                cell.addTo(graph);
                cell.position(ProjectElements[elem].position[ProjectSettings.selectedDiagram].x, ProjectElements[elem].position[ProjectSettings.selectedDiagram].y)
                ProjectElements[elem].hidden[ProjectSettings.selectedDiagram] = false;
                drawGraphElement(cell, ProjectSettings.selectedLanguage, representation);
                restoreHiddenElem(elem, cell, true);
            }
        }
        for (let elem of graph.getElements()) {
            drawGraphElement(elem, ProjectSettings.selectedLanguage, representation);
            if (typeof elem.id === "string") {
                if (spread) spreadConnections(elem.id, true, false);
                restoreHiddenElem(elem.id, elem, false);
            }
        }
        for (let link of graph.getLinks()) {
            if (!(ProjectLinks[link.id].iri in Links) || (!(ProjectLinks[link.id].active))) {
                link.remove();
            }
        }
        ProjectSettings.switchElements = [];
        return false;
    }
}

export function highlightCell(id: string, color: string = '#0000FF') {
    let cell = graph.getCell(id);
    if (cell.isLink()) {
        cell.attr({line: {stroke: color}});
    } else {
        if (cell.id) cell.attr({[getElementShape(cell.id)]: {stroke: color}});
    }
}

export function unHighlightCell(id: string, color: string = '#000000') {
    let cell = graph.getCell(id);
    if (cell.isLink()) {
        cell.attr({line: {stroke: color}});
    } else {
        if (cell.id) {
            drawGraphElement(cell as joint.dia.Element, ProjectSettings.selectedLanguage, ProjectSettings.representation)
        }
    }
}

export function unHighlightAll() {
    for (let cell of graph.getCells()) {
        if (typeof cell.id === "string") {
            unHighlightCell(cell.id);
        }
    }
}

export function getElementShape(id: string | number): string {
    let types = VocabularyElements[ProjectElements[id].iri].types;
    for (let type in Shapes) {
        if (types.includes(type)) return Shapes[type].body;
    }
    return Shapes["default"].body;
}

export function restoreHiddenElem(id: string, cls: joint.dia.Element, restoreConnectionPosition: boolean) {
    if (!(ProjectElements[id].diagrams.includes(ProjectSettings.selectedDiagram))) {
        ProjectElements[id].diagrams.push(ProjectSettings.selectedDiagram)
    }
    for (let link of Object.keys(ProjectLinks).filter(link => ProjectLinks[link].active)) {
        if ((ProjectLinks[link].source === id || ProjectLinks[link].target === id)
            && (graph.getCell(ProjectLinks[link].source) && graph.getCell(ProjectLinks[link].target)) && (
                (ProjectSettings.representation === Representation.FULL ? ProjectLinks[link].iri in Links : (!(ProjectLinks[link].iri in Links))
                ))) {
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
            lnk.vertices(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]);
        } else if (ProjectSettings.representation === Representation.FULL &&
            ProjectLinks[link].target === id &&
            ProjectLinks[link].iri in Links &&
            graph.getCell(ProjectLinks[link].target)) {
            let relID = ProjectLinks[link].source;
            for (let targetLink in ProjectLinks) {
                if (ProjectLinks[targetLink].source === relID && ProjectLinks[targetLink].target !== id && graph.getCell(ProjectLinks[targetLink].target)) {
                    let domainLink = getNewLink(ProjectLinks[link].type, link);
                    let rangeLink = getNewLink(ProjectLinks[targetLink].type, targetLink);
                    let existingRel = graph.getElements().find(elem => elem.id === relID);
                    let relationship = existingRel ? existingRel : new graphElement({id: relID});
                    if (ProjectElements[relID].position[ProjectSettings.selectedDiagram] &&
                        ProjectElements[relID].position[ProjectSettings.selectedDiagram].x !== 0 &&
                        ProjectElements[relID].position[ProjectSettings.selectedDiagram].y !== 0 &&
                        restoreConnectionPosition) {
                        relationship.position(ProjectElements[relID].position[ProjectSettings.selectedDiagram].x,
                            ProjectElements[relID].position[ProjectSettings.selectedDiagram].y);
                    } else {
                        let sourcepos = graph.getCell(ProjectLinks[link].target).get('position');
                        let targetpos = graph.getCell(ProjectLinks[targetLink].target).get('position');
                        let posx = ((sourcepos.x + targetpos.x) / 2);
                        let posy = ((sourcepos.y + targetpos.y) / 2);
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
                    if (restoreConnectionPosition) {
                        domainLink.vertices(ProjectLinks[link].vertices[ProjectSettings.selectedDiagram]);
                        rangeLink.vertices(ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram]);
                    } else {
                        updateProjectElementDiagram(ProjectSettings.contextEndpoint,
                            relID, ProjectSettings.selectedDiagram);
                        if (ProjectLinks[link].vertices[ProjectSettings.selectedDiagram])
                            updateDeleteProjectLinkVertex(ProjectSettings.contextEndpoint, link, 0,
                                ProjectLinks[link].vertices[ProjectSettings.selectedDiagram].length);
                        if (ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram])
                            updateDeleteProjectLinkVertex(ProjectSettings.contextEndpoint, targetLink, 0,
                                ProjectLinks[targetLink].vertices[ProjectSettings.selectedDiagram].length);
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
}

export function getNewLabel(iri: string, language: string) {
    return "«" + getName(iri, language).toLowerCase() + "»\n" + LocaleMain.untitled + " " + getName(iri, language);
}