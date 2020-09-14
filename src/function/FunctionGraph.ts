import {Links, ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {getName, getStereotypeList, parsePrefix} from "./FunctionEditVars";
import {graph} from "../graph/Graph";
import {getLinkOrVocabElem, getVocabElementByElementID} from "./FunctionGetVars";
import * as joint from "jointjs";
import * as LocaleMain from "../locale/LocaleMain.json";
import {graphElement} from "../graph/GraphElement";
import {LinkConfig} from "../config/LinkConfig";
import {addLink} from "./FunctionCreateVars";
import {Cardinality} from "../datatypes/Cardinality";
import {updateProjectLink} from "../interface/TransactionInterface";


let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";

export function nameGraphElement(cell: joint.dia.Cell, languageCode: string) {
    if (typeof cell.id === "string") {
        let vocabElem = getVocabElementByElementID(cell.id);
        cell.prop('attrs/label/text', getStereotypeList(vocabElem.types, languageCode).map((str) => "«" + str.toLowerCase() + "»\n").join("") + (vocabElem.labels[languageCode] === "" ? "<blank>" : vocabElem.labels[languageCode]));
    }
}

export function getNewLink(type?: string, id?: string): joint.dia.Link {
    let link = new joint.shapes.standard.Link({id: id});
    if (type && type in LinkConfig) {
        link = LinkConfig[type].newLink(id);
    }
    link.on('change:vertices', () => {
        link.vertices().forEach((vert, i) => {
            let verti = vert;
            let proji = ProjectLinks[link.id].vertices[i];
            if ((!(proji) || (Math.abs(verti.x - proji.x) > 10 || Math.abs(verti.y - proji.y) > 10)) && typeof link.id === "string") {
                ProjectLinks[link.id].vertices = link.vertices();
                updateProjectLink(ProjectSettings.contextEndpoint, link.id);
            }
        })
    })
    return link;
}

export function nameGraphLink(cell: joint.dia.Link, languageCode: string) {
    if (typeof cell.id === "string" && ProjectLinks[cell.id].type === "default") {
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

export function setRepresentation(representation: string) {
    if (representation === "compact") {
        for (let elem of graph.getElements()) {
            if (
                VocabularyElements[ProjectElements[elem.id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
            ) {
                let links = graph.getConnectedLinks(elem);
                if (links.length > 1) {
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
                            newLink.appendLabel({attrs: {text: {text: VocabularyElements[ProjectElements[elem.id].iri].labels[ProjectSettings.selectedLanguage]}}});
                            ProjectLinks[newLink.id].sourceCardinality =
                                new Cardinality(ProjectLinks[sourceLink.id].sourceCardinality.getFirstCardinality(),
                                    ProjectLinks[sourceLink.id].targetCardinality.getFirstCardinality());
                            ProjectLinks[newLink.id].targetCardinality =
                                new Cardinality(ProjectLinks[targetLink.id].sourceCardinality.getFirstCardinality(),
                                    ProjectLinks[targetLink.id].targetCardinality.getFirstCardinality());
                            if (ProjectLinks[newLink.id].type === "default") {
                                if (ProjectLinks[newLink.id].sourceCardinality.getString() !== LocaleMain.none) {
                                    newLink.appendLabel({
                                        attrs: {text: {text: ProjectLinks[newLink.id].sourceCardinality.getString()}},
                                        position: {distance: 20}
                                    });
                                }
                                if (ProjectLinks[newLink.id].targetCardinality.getString() !== LocaleMain.none) {
                                    newLink.appendLabel({
                                        attrs: {text: {text: ProjectLinks[newLink.id].targetCardinality.getString()}},
                                        position: {distance: -20}
                                    });
                                }
                            }
                        }
                        sourceLink.remove();
                        targetLink.remove();
                    }
                }
                if (graph.getConnectedLinks(elem).length < 2) {
                    ProjectElements[elem.id].position[ProjectSettings.selectedDiagram] = elem.position();
                    ProjectElements[elem.id].hidden[ProjectSettings.selectedDiagram] = true;
                    elem.remove();
                }
            }
        }
        let del = false;
        for (let link of graph.getLinks()) {
            if (ProjectLinks[link.id].iri in Links && Links[ProjectLinks[link.id].iri].type === "default") {
                link.remove();
                del = true;
            }
        }
        ProjectSettings.representation = "compact";
        return del;
    } else if (representation === "full") {
        for (let link of graph.getLinks()) {
            if ((ProjectLinks[link.id] && !(ProjectLinks[link.id].iri in Links))) {
                link.remove();
                ProjectLinks[link.id].active = false;
            }
        }
        for (let elem of graph.getElements()) {
            if (typeof elem.id === "string") {
                restoreHiddenElem(elem.id, elem);
            }
        }
        ProjectSettings.representation = "full";
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

export function restoreHiddenElem(id: string, cls: joint.dia.Element) {
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
            if (ProjectLinks[link].type === "default") {
                if (ProjectLinks[link].sourceCardinality.getString() !== LocaleMain.none) {
                    lnk.appendLabel({
                        attrs: {text: {text: ProjectLinks[link].sourceCardinality.getString()}},
                        position: {distance: 20}
                    });
                }
                if (ProjectLinks[link].targetCardinality.getString() !== LocaleMain.none) {
                    lnk.appendLabel({
                        attrs: {text: {text: ProjectLinks[link].targetCardinality.getString()}},
                        position: {distance: -20}
                    });
                }
                lnk.appendLabel({
                    attrs: {text: {text: getLinkOrVocabElem(ProjectLinks[link].iri).labels[ProjectSettings.selectedLanguage]}},
                    position: {distance: 0.5}
                });
            }
            lnk.source({id: ProjectLinks[link].source});
            lnk.target({id: ProjectLinks[link].target});
            lnk.vertices(ProjectLinks[link].vertices);
            lnk.addTo(graph);
        } else if (ProjectLinks[link].active &&
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
                        ProjectElements[relID].position[ProjectSettings.selectedDiagram].y !== 0) {
                        relationship.position(ProjectElements[relID].position[ProjectSettings.selectedDiagram].x, ProjectElements[relID].position[ProjectSettings.selectedDiagram].y);
                    } else {
                        let sourcepos = graph.getCell(ProjectLinks[link].target).get('position');
                        let targetpos = graph.getCell(ProjectLinks[targetLink].target).get('position');
                        let posx = ((sourcepos.x + targetpos.x) / 2);
                        let posy = ((sourcepos.y + targetpos.y) / 2);
                        relationship.position(posx, posy);
                    }
                    ProjectElements[relID].hidden[ProjectSettings.selectedDiagram] = false;
                    nameGraphElement(relationship, ProjectSettings.selectedLanguage);
                    domainLink.source({id: relID});
                    domainLink.target({id: ProjectLinks[link].target});
                    rangeLink.source({id: relID});
                    rangeLink.target({id: ProjectLinks[targetLink].target});
                    domainLink.appendLabel({
                        attrs: {text: {text: getLinkOrVocabElem(ProjectLinks[link].iri).labels[ProjectSettings.selectedLanguage]}},
                        position: {distance: 0.5}
                    });
                    rangeLink.appendLabel({
                        attrs: {text: {text: getLinkOrVocabElem(ProjectLinks[targetLink].iri).labels[ProjectSettings.selectedLanguage]}},
                        position: {distance: 0.5}
                    });
                    if (ProjectLinks[link].type === "default") {
                        if (ProjectLinks[link].sourceCardinality.getString() !== LocaleMain.none) {
                            domainLink.appendLabel({
                                attrs: {text: {text: ProjectLinks[link].sourceCardinality.getString()}},
                                position: {distance: 20}
                            });
                        }
                        if (ProjectLinks[link].targetCardinality.getString() !== LocaleMain.none) {
                            domainLink.appendLabel({
                                attrs: {text: {text: ProjectLinks[link].targetCardinality.getString()}},
                                position: {distance: -20}
                            });
                        }
                    }
                    if (ProjectLinks[targetLink].type === "default") {
                        if (ProjectLinks[targetLink].sourceCardinality.getString() !== LocaleMain.none) {
                            rangeLink.appendLabel({
                                attrs: {text: {text: ProjectLinks[targetLink].sourceCardinality.getString()}},
                                position: {distance: 20}
                            });
                        }
                        if (ProjectLinks[targetLink].targetCardinality.getString() !== LocaleMain.none) {
                            rangeLink.appendLabel({
                                attrs: {text: {text: ProjectLinks[targetLink].targetCardinality.getString()}},
                                position: {distance: -20}
                            });
                        }
                    }
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