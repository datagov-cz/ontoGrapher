import {Links, ProjectElements, ProjectLinks, ProjectSettings} from "../config/Variables";
import {getName, getStereotypeList} from "./FunctionEditVars";
import {graph} from "../graph/Graph";
import {getLinkOrVocabElem, getVocabElementByElementID} from "./FunctionGetVars";
import * as joint from "jointjs";
import * as LocaleMain from "../locale/LocaleMain.json";
import {graphElement} from "../graph/GraphElement";
import {LinkConfig} from "../config/LinkConfig";

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
    } else if (Links[ProjectSettings.selectedLink] && Links[ProjectSettings.selectedLink].type in LinkConfig) {
        link = LinkConfig[Links[ProjectSettings.selectedLink].type].newLink(id);
    }
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
        if (ProjectElements[id].position[ProjectSettings.selectedDiagram] && ProjectElements[id].position[ProjectSettings.selectedDiagram].x !== 0 && ProjectElements[id].position[ProjectSettings.selectedDiagram].y !== 0) {
            cls.position(ProjectElements[id].position[ProjectSettings.selectedDiagram].x, ProjectElements[id].position[ProjectSettings.selectedDiagram].y);
        }
    }
    if (!(ProjectElements[id].diagrams.includes(ProjectSettings.selectedDiagram))) {
        ProjectElements[id].diagrams.push(ProjectSettings.selectedDiagram)
    }
    for (let link in ProjectLinks) {
        if ((ProjectLinks[link].source === id || ProjectLinks[link].target === id) && (graph.getCell(ProjectLinks[link].source) && graph.getCell(ProjectLinks[link].target))) {
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
            if (ProjectLinks[link] && ProjectLinks[link].vertices) {
                lnk.vertices(ProjectLinks[link].vertices);
            }
            lnk.addTo(graph);
        } else if (ProjectLinks[link].target === id && graph.getCell(ProjectLinks[link].target)) {
            let relID = ProjectLinks[link].source;
            for (let targetLink in ProjectLinks) {
                if (ProjectLinks[targetLink].source === relID && ProjectLinks[targetLink].target !== id && graph.getCell(ProjectLinks[targetLink].target)) {
                    let domainLink = getNewLink(ProjectLinks[link].type, link);
                    let rangeLink = getNewLink(ProjectLinks[targetLink].type, targetLink);
                    let relationship = new graphElement({id: relID});
                    let sourcepos = graph.getCell(ProjectLinks[link].target).get('position');
                    let targetpos = graph.getCell(ProjectLinks[targetLink].target).get('position');
                    let posx = ((sourcepos.x + targetpos.x) / 2);
                    let posy = ((sourcepos.y + targetpos.y) / 2);
                    nameGraphElement(relationship, ProjectSettings.selectedLanguage);
                    relationship.position(posx, posy);
                    domainLink.source({id: relID});
                    domainLink.target({id: ProjectLinks[link].target});
                    if (ProjectLinks[link] && ProjectLinks[link].vertices) {
                        domainLink.vertices(ProjectLinks[link].vertices);
                    }
                    rangeLink.source({id: relID});
                    rangeLink.target({id: ProjectLinks[targetLink].target});
                    if (ProjectLinks[targetLink] && ProjectLinks[targetLink].vertices) {
                        rangeLink.vertices(ProjectLinks[targetLink].vertices);
                    }
                    domainLink.appendLabel({
                        attrs: {text: {text: getLinkOrVocabElem(ProjectLinks[link].iri).labels[ProjectSettings.selectedLanguage]}},
                        position: {distance: 0.5}
                    });
                    rangeLink.appendLabel({
                        attrs: {text: {text: getLinkOrVocabElem(ProjectLinks[targetLink].iri).labels[ProjectSettings.selectedLanguage]}},
                        position: {distance: 0.5}
                    });
                    relationship.addTo(graph);
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