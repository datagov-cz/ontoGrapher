import {ProjectElements, Schemes, VocabularyElements} from "../config/Variables";
import {getModelName, getStereotypeList} from "./FunctionEditVars";
import {graph} from "../graph/graph";
import {getVocabElementByElementID} from "./FunctionGetVars";

export function nameGraphElement(cell: joint.dia.Cell, languageCode: string) {
    let vocabElem = getVocabElementByElementID(cell.id);
    if (Schemes[vocabElem.inScheme].readOnly) {
        cell.prop('attrs/label/text', getStereotypeList(vocabElem.types, languageCode).map((str) => "«" + str.toLowerCase() + "»\n").join("") + vocabElem.labels[languageCode]);
    } else {
        cell.prop('attrs/label/text', vocabElem.labels[languageCode]);
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