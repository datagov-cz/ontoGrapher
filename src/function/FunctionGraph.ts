import {Links, ProjectElements, ProjectLinks, ProjectSettings, Schemes, VocabularyElements} from "../config/Variables";
import {getName, getStereotypeList, parsePrefix} from "./FunctionEditVars";
import {graph} from "../graph/Graph";
import {getLinkOrVocabElem} from "./FunctionGetVars";
import * as joint from "jointjs";
import * as LocaleMain from "../locale/LocaleMain.json";
import {graphElement} from "../graph/GraphElement";
import {LinkConfig} from "../config/LinkConfig";
import {addLink} from "./FunctionCreateVars";
import {Cardinality} from "../datatypes/Cardinality";
import {LinkType, Representation} from "../config/Enum";


let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";

export function drawGraphElement(cell: joint.dia.Cell, languageCode: string, representation: number) {
    if (typeof cell.id === "string") {
        let types = VocabularyElements[ProjectElements[cell.id].iri].types;
        let label = VocabularyElements[ProjectElements[cell.id].iri].labels[languageCode];
        let labels: string[] = [];
        if (ProjectSettings.viewStereotypes)
            getStereotypeList(types, languageCode).forEach((str) => labels.push("«" + str.toLowerCase() + "»"));
        labels.push(label === "" ? "<blank>" : label);
        cell.prop('attrs/label/text', labels.join("\n"));
        let text = [];
        if (representation === Representation.COMPACT) {
            for (let link in ProjectLinks) {
                if ((ProjectLinks[link].source === cell.id || ProjectLinks[link].target === cell.id) &&
                    ProjectLinks[link].active) {
                    if (ProjectLinks[link].iri === parsePrefix("z-sgov-pojem", "má-vlastnost") &&
                        ProjectLinks[link].source === cell.id && ProjectLinks[link].active) {
                        text.push(VocabularyElements[ProjectElements[ProjectLinks[link].target].iri].labels[languageCode])
                    } else if (ProjectLinks[link].iri === parsePrefix("z-sgov-pojem", "je-vlastností") &&
                        ProjectLinks[link].target === cell.id && ProjectLinks[link].active) {
                        text.push(VocabularyElements[ProjectElements[ProjectLinks[link].source].iri].labels[languageCode])
                    }
                }
            }
        }
        cell.prop("attrs/labelAttrs/text", text.join("\n"));
        let width = representation === Representation.COMPACT ?
            Math.max(9 * (label.length),
                text.length > 0 ? 8 * (text.reduce((a, b) => a.length > b.length ? a : b, "").length) : 0) :
            labels.reduce((a, b) => a.length > b.length ? a : b, "").length * 10;
        cell.prop('attrs/body/width', width);
        cell.prop('attrs/text/x', width / 2);
        let attrHeight = (24 + ((labels.length - 1) * 18));
        let height = (text.length > 0 ? (4 + (text.length * 13)) : 0) +
            attrHeight;
        cell.prop('attrs/labelAttrs/y', attrHeight);
        cell.prop('attrs/body/height', height);
        cell.prop('attrs/body/fill',
            Schemes[VocabularyElements[ProjectElements[cell.id].iri].inScheme].color);
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
                ProjectLinks[id].target === sourceElem
            );
            let targetLink = Object.keys(ProjectLinks).find(id =>
                ProjectElements[pred].connections.includes(id) &&
                ProjectLinks[id].iri === mvp2IRI &&
                ProjectLinks[id].target === targetElem
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

export function setRepresentation(representation: number) {
    if (representation === Representation.COMPACT) {
        let del = false;
        ProjectSettings.representation = Representation.COMPACT;
        for (let elem of graph.getElements()) {
            drawGraphElement(elem, ProjectSettings.selectedLanguage, representation);
            if (
                VocabularyElements[ProjectElements[elem.id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
            ) {
                if (graph.getConnectedLinks(elem).length > 1) {
                    let sourceLink = graph.getConnectedLinks(elem).find(src => ProjectLinks[src.id].iri === mvp1IRI);
                    let targetLink = graph.getConnectedLinks(elem).find(src => ProjectLinks[src.id].iri === mvp2IRI);
                    if (sourceLink && targetLink) {
                        let newLink = getNewLink();
                        let source = sourceLink.getTargetCell()?.id;
                        let target = targetLink.getTargetCell()?.id;
                        if (typeof newLink.id === "string" && typeof source === "string" && typeof target === "string") {
                            newLink.source({id: source});
                            newLink.target({id: target});
                            addLink(newLink.id, ProjectElements[elem.id].iri, source, target);
                            newLink.addTo(graph);
                            if (source === target) {
                                let coords = newLink.getSourcePoint();
                                newLink.vertices([
                                    new joint.g.Point(coords.x, coords.y + 100),
                                    new joint.g.Point(coords.x + 400, coords.y + 100),
                                    new joint.g.Point(coords.x + 400, coords.y),
                                ])
                            }
                            ProjectLinks[newLink.id].sourceCardinality =
                                new Cardinality(
                                    ProjectLinks[sourceLink.id].targetCardinality.getFirstCardinality(),
                                    ProjectLinks[sourceLink.id].targetCardinality.getSecondCardinality());
                            ProjectLinks[newLink.id].targetCardinality =
                                new Cardinality(
                                    ProjectLinks[sourceLink.id].sourceCardinality.getFirstCardinality(),
                                    ProjectLinks[sourceLink.id].sourceCardinality.getSecondCardinality());
                            setLabels(newLink, VocabularyElements[ProjectElements[elem.id].iri].labels[ProjectSettings.selectedLanguage]);
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
        for (let link of graph.getLinks()) {
            if ((ProjectLinks[link.id] && !(ProjectLinks[link.id].iri in Links))) {
                link.remove();
                ProjectLinks[link.id].active = false;
            }
        }
        for (let elem of ProjectSettings.switchElements) {
            let find = graph.getElements().find(cell => cell.id === elem &&
                ProjectElements[elem].active && ProjectElements[elem].hidden[ProjectSettings.selectedDiagram]);
            let cell = find || new graphElement({id: elem})
            cell.addTo(graph);
            cell.position(ProjectElements[elem].position[ProjectSettings.selectedDiagram].x, ProjectElements[elem].position[ProjectSettings.selectedDiagram].y)
            ProjectElements[elem].hidden[ProjectSettings.selectedDiagram] = false;
            drawGraphElement(cell, ProjectSettings.selectedLanguage, representation);
            restoreHiddenElem(elem, cell, true);
        }
        for (let elem of graph.getElements()) {
            drawGraphElement(elem, ProjectSettings.selectedLanguage, representation);
            if (typeof elem.id === "string") {
                restoreHiddenElem(elem.id, elem, true);
            }
        }
        ProjectSettings.switchElements = [];
        return false;
    }
}

export function highlightCell(id: string) {
    let cell = graph.getCell(id);
    if (cell.isLink()) {
        cell.attr({line: {stroke: '#0000FF'}});
    } else {
        cell.attr({body: {stroke: '#0000FF'}});
    }
}

export function unHighlightCell(id: string) {
    let cell = graph.getCell(id);
    if (cell.isLink()) {
        cell.attr({line: {stroke: '#000000'}});
    } else {
        cell.attr({body: {stroke: '#000000'}});
    }
}

export function unHighlightAll() {
    for (let cell of graph.getCells()) {
        if (typeof cell.id === "string") {
            unHighlightCell(cell.id);
        }
    }
}

export function restoreHiddenElem(id: string, cls: joint.dia.Element, restoreConnectionPosition: boolean) {
    if (ProjectElements[id].position) {
        if (ProjectElements[id].position[ProjectSettings.selectedDiagram] &&
            ProjectElements[id].position[ProjectSettings.selectedDiagram].x !== 0 && ProjectElements[id].position[ProjectSettings.selectedDiagram].y !== 0) {
            cls.position(ProjectElements[id].position[ProjectSettings.selectedDiagram].x, ProjectElements[id].position[ProjectSettings.selectedDiagram].y);
        }
    }
    if (!(ProjectElements[id].diagrams.includes(ProjectSettings.selectedDiagram))) {
        ProjectElements[id].diagrams.push(ProjectSettings.selectedDiagram)
    }
    for (let link in ProjectLinks) {
        if (ProjectLinks[link].active &&
            (ProjectLinks[link].source === id || ProjectLinks[link].target === id)
            && (graph.getCell(ProjectLinks[link].source) && graph.getCell(ProjectLinks[link].target))) {
            let lnk = getNewLink(ProjectLinks[link].type, link);
            setLabels(lnk, getLinkOrVocabElem(ProjectLinks[link].iri).labels[ProjectSettings.selectedLanguage])
            lnk.source({id: ProjectLinks[link].source});
            lnk.target({id: ProjectLinks[link].target});
            lnk.vertices(ProjectLinks[link].vertices);
            lnk.addTo(graph);
        } else if (ProjectLinks[link].active &&
            ProjectSettings.representation === Representation.FULL &&
            ProjectLinks[link].target === id &&
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
                    ProjectElements[relID].hidden[ProjectSettings.selectedDiagram] = false;
                    drawGraphElement(relationship, ProjectSettings.selectedLanguage, Representation.FULL);
                    domainLink.source({id: relID});
                    domainLink.target({id: ProjectLinks[link].target});
                    rangeLink.source({id: relID});
                    rangeLink.target({id: ProjectLinks[targetLink].target});
                    setLabels(domainLink, getLinkOrVocabElem(ProjectLinks[link].iri).labels[ProjectSettings.selectedLanguage]);
                    setLabels(rangeLink, getLinkOrVocabElem(ProjectLinks[targetLink].iri).labels[ProjectSettings.selectedLanguage]);
                    relationship.addTo(graph);
                    domainLink.vertices(ProjectLinks[link].vertices);
                    rangeLink.vertices(ProjectLinks[targetLink].vertices);
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