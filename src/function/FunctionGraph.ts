import {Links, ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {getName, getStereotypeList, parsePrefix} from "./FunctionEditVars";
import {graph} from "../graph/Graph";
import {getLinkOrVocabElem, getVocabElementByElementID} from "./FunctionGetVars";
import * as joint from "jointjs";
import * as LocaleMain from "../locale/LocaleMain.json";
import {graphElement} from "../graph/GraphElement";
import {LinkConfig} from "../config/LinkConfig";
import {addLink} from "./FunctionCreateVars";

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

export function switchRepresentation(representation: string) {
    let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
    let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";
    if (representation === "compact") {
        for (let elem of graph.getElements()) {
            if (
                VocabularyElements[ProjectElements[elem.id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu")) ||
                VocabularyElements[ProjectElements[elem.id].iri].types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))
            ) {
                let links = graph.getConnectedLinks(elem);
                if (links.length > 1) {
                    // for (let link in links) {
                    let sourceLink = graph.getConnectedLinks(elem).find(src => ProjectLinks[src.id].iri === mvp1IRI);
                    let targetLink = graph.getConnectedLinks(elem).find(src => ProjectLinks[src.id].iri === mvp2IRI);
                    // //pred -mvp2-> target IRI(s)
                    // let targetConns = links.filter(src => ProjectLinks[src.id].iri === mvp2IRI).map(link => ProjectElements[ProjectLinks[link.id].target].iri);
                    // //pred -mvp1->
                    // let sourceLink = links.find(
                    //     src => ProjectLinks[src.id].iri === mvp1IRI &&
                    //         VocabularyElements[ProjectElements[ProjectLinks[src.id].target].iri].connections.find(conn =>
                    //             !conn.initialize && targetConns.includes(conn.target) && conn.onProperty === ProjectElements[elem.id].iri));
                    // let targetLink = links.find(src => sourceLink && ProjectLinks[src.id].iri === mvp2IRI &&
                    //     VocabularyElements[ProjectElements[ProjectLinks[sourceLink.id].target].iri].connections.find(
                    //         conn => conn.target === ProjectElements[ProjectLinks[src.id].target].iri))
                    if (sourceLink && targetLink) {
                        let newLink = getNewLink();
                        let source = sourceLink.getTargetCell()?.id;
                        let target = targetLink.getTargetCell()?.id;
                        newLink.source({id: source});
                        newLink.target({id: target});
                        if (typeof newLink.id === "string" && typeof source === "string" && typeof target === "string") {
                            addLink(newLink.id, ProjectElements[elem.id].iri, source, target);
                            newLink.addTo(graph);
                            newLink.appendLabel({attrs: {text: {text: VocabularyElements[ProjectElements[elem.id].iri].labels[ProjectSettings.selectedLanguage]}}});
                            }
                            sourceLink.remove();
                            targetLink.remove();
                            if (graph.getConnectedLinks(elem).length < 2) elem.remove();
                        }
                    }
                // }
            }
        }
        let del = false;
        for (let link of graph.getLinks()) {
            if (ProjectLinks[link.id] && (ProjectLinks[link.id].iri === mvp1IRI || ProjectLinks[link.id].iri === mvp2IRI) && Links[ProjectLinks[link.id].iri].type === "default") {
                link.remove();
                del = true;
            }
        }
        ProjectSettings.representation = "compact";
        return del;
    } else if (representation === "full") {
        for (let link of graph.getLinks()) {
            if (ProjectLinks[link.id] && ProjectLinks[link.id].iri in VocabularyElements) {
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
        if (ProjectElements[id].position[ProjectSettings.selectedDiagram] && ProjectElements[id].position[ProjectSettings.selectedDiagram].x !== 0 && ProjectElements[id].position[ProjectSettings.selectedDiagram].y !== 0) {
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
            lnk.addTo(graph);
        } else if (ProjectLinks[link].active &&
            ProjectLinks[link].target === id && graph.getCell(ProjectLinks[link].target)) {
            let relID = ProjectLinks[link].source;
            for (let targetLink in ProjectLinks) {
                if (ProjectLinks[targetLink].source === relID && ProjectLinks[targetLink].target !== id && graph.getCell(ProjectLinks[targetLink].target)) {
                    let domainLink = getNewLink(ProjectLinks[link].type, link);
                    let rangeLink = getNewLink(ProjectLinks[targetLink].type, targetLink);
                    let relationship = new graphElement({id: relID});
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