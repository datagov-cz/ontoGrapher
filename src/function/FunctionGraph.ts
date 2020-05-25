import {ProjectElements, ProjectLinks, ProjectSettings} from "../config/Variables";
import {getName, getStereotypeList} from "./FunctionEditVars";
import {graph} from "../graph/graph";
import {getLinkOrVocabElem, getVocabElementByElementID} from "./FunctionGetVars";
import * as joint from "jointjs";
import * as LocaleMain from "../locale/LocaleMain.json";

export function nameGraphElement(cell: joint.dia.Cell, languageCode: string) {
    if (typeof cell.id === "string") {
        let vocabElem = getVocabElementByElementID(cell.id);
        cell.prop('attrs/label/text', getStereotypeList(vocabElem.types, languageCode).map((str) => "«" + str.toLowerCase() + "»\n").join("") + vocabElem.labels[languageCode]);
    }
}

export function nameGraphLink(cell: joint.dia.Link, languageCode: string) {
    if (typeof cell.id === "string") {
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
            let lnk = new joint.shapes.standard.Link({id: link});
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
            lnk.source({id: ProjectLinks[link].source});
            lnk.target({id: ProjectLinks[link].target});
            if (ProjectLinks[link] && ProjectLinks[link].vertices) {
                lnk.vertices(ProjectLinks[link].vertices);
            }
            lnk.addTo(graph);
        }
    }
}

export function getNewLabel(iri: string, language: string) {
    return "«" + getName(iri, language).toLowerCase() + "»\n" + LocaleMain.untitled + " " + getName(iri, language);
}

// export function restoreDomainOfConnections() {
//     for (let iri in VocabularyElements) {
//         if (VocabularyElements[iri].domain && VocabularyElements[iri].range) {
//             let domain = VocabularyElements[iri].domain;
//             let range = VocabularyElements[iri].range;
//             let domainCell = "";
//             let rangeCell = "";
//             for (let cell of graph.getElements()) {
//                 if (ProjectElements[cell.id].iri === domain) {
//                     if (typeof cell.id === "string") {
//                         domainCell = cell.id;
//                     }
//                 }
//                 if (ProjectElements[cell.id].iri === range) {
//                     if (typeof cell.id === "string") {
//                         rangeCell = cell.id;
//                     }
//                 }
//             }
//             if (domainCell && rangeCell) {
//                 let link = new joint.shapes.standard.Link();
//                 link.source({id: domainCell});
//                 link.target({id: rangeCell});
//                 link.appendLabel({
//                     attrs: {text: {text: VocabularyElements[iri].labels[ProjectSettings.selectedLanguage]}},
//                     position: {distance: 0.5}
//                 });
//                 let insert = true;
//                 let sourceIRI = ProjectElements[domainCell].iri;
//                 for (let lnk in ProjectLinks) {
//                     if (
//                         ProjectLinks[lnk].source === domainCell &&
//                         ProjectLinks[lnk].target === rangeCell
//                         && ProjectLinks[lnk].iri === iri
//                         && (VocabularyElements[sourceIRI].domainOf.includes(iri))
//                     ) {
//                         insert = false;
//                         break;
//                     }
//                 }
//                 if (insert) {
//                     link.addTo(graph);
//                     VocabularyElements[sourceIRI].domainOf.splice(VocabularyElements[sourceIRI].domainOf.indexOf(iri),1);
//                     if (typeof link.id === "string") {
//                         addLink(link.id, iri, domainCell, rangeCell);
//                         ProjectElements[domainCell].connections.push(link.id);
//                     }
//                     console.log(VocabularyElements[sourceIRI].domainOf);
//                 }
//             }
//         }
//     }
// }