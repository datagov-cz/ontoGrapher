import * as Locale from "./../locale/LocaleMain.json";
import {Links, Schemes, Stereotypes, VocabularyElements} from "../config/Variables";
import {fetchConcepts, getScheme} from "./SPARQLInterface";
import {addElemsToPackage, createValues} from "../function/FunctionCreateVars";
import {addDomainOfIRIs, initLanguageObject} from "../function/FunctionEditVars";
import {checkLabels} from "../function/FunctionGetVars";

export async function getVocabulariesFromRemoteJSON(pathToJSON: string, callback: Function) {
    const isURL = require('is-url');
    if (isURL(pathToJSON)) {
        await fetch(pathToJSON).then(response => response.json()).then(
            async json => {
                for (const key of Object.keys(json)) {
                    let data = json[key];
                    await getScheme(data.sourceIRI, data.endpoint, data.type === "model");
                    Schemes[data.sourceIRI].labels = initLanguageObject(key);
                    if (data.type === "stereotype") {
                        await fetchConcepts(
                            data.endpoint,
                            data.sourceIRI,
                            Stereotypes,
                            false,
                            undefined,
                            undefined,
                            [data.classIRI],
                            data.values ? createValues(data.values, data.prefixes) : undefined
                        );
                        await fetchConcepts(
                            data.endpoint,
                            data.sourceIRI,
                            Links,
                            false,
                            undefined,
                            undefined,
                            [data.relationshipIRI],
                            undefined
                        );
                    } else if (data.type === "model") {
                        await fetchConcepts(
                            data.endpoint,
                            data.sourceIRI,
                            VocabularyElements,
                            true
                        )
                        addElemsToPackage(data.sourceIRI);
                    }
                    addDomainOfIRIs();
                    checkLabels();
                }
            }
        );
    } else {
        callback(false);
        throw new Error(Locale.vocabularyNotFound)
    }
}