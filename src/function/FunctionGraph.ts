import {ProjectElements, Schemes, VocabularyElements} from "../config/Variables";
import {getStereotypeList} from "./FunctionEditVars";
import {graph} from "../graph/graph";

export function nameGraphElement(cell: joint.dia.Cell, languageCode: string) {
    if (Schemes[VocabularyElements[ProjectElements[cell.id].iri].inScheme].readOnly) {
        cell.prop('attrs/label/text', getStereotypeList(ProjectElements[cell.id].iri, languageCode).map((str) => "«" + str.toLowerCase() + "»\n").join("") + ProjectElements[cell.id].names[languageCode]);
    } else {

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