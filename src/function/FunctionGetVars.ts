import {Languages, Links, ProjectElements, Schemes, Stereotypes, VocabularyElements} from "../config/Variables";
import {initLanguageObject} from "./FunctionEditVars";

export function getVocabElementByElementID(id: string): { [key: string]: any } {
    return VocabularyElements[ProjectElements[id].iri];
}

export function getLinkOrVocabElem(iri: string): { [key: string]: any } {
    return iri in Links ? Links[iri] : VocabularyElements[iri];
}

export function getStereotypeOrVocabElem(iri: string): { [key: string]: any } {
    return iri in Stereotypes ? Stereotypes[iri] : VocabularyElements[iri];
}

export function isLinkElem(iri: string): boolean {
    return iri in Links;
}

export function getLabelOrBlank(labels: { [key: string]: string }, language: string): string {
    return labels[language] && labels[language].length > 0 ? labels[language] : "<blank>";
}

export function getNameOrBlank(name: string) {
    return name ? name : "<blank>";
}

export function isElemReadOnlyByID(id: string): boolean {
    return Schemes[VocabularyElements[ProjectElements[id].iri].inScheme].readOnly;
}

export function isElemReadOnlyByIRI(iri: string): boolean {
    return Schemes[VocabularyElements[iri].inScheme].readOnly;
}

export function checkLabels() {
    for (let link in Links) {
        if (!(Links[link].labels[Object.keys(Languages)[0]])) {
            let label = link.lastIndexOf('/');
            Links[link].labels = initLanguageObject(link.substring(label + 1));
        }
    }
}