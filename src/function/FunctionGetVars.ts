import {ProjectElements, VocabularyElements} from "../config/Variables";

export function getVocabElementByElementID(id: string | number){
    return VocabularyElements[ProjectElements[id].iri];
}