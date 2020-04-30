import * as Locale from "./../locale/LocaleMain.json";
import {Links, ProjectSettings, Schemes, Stereotypes, VocabularyElements} from "../config/Variables";
import {fetchConcepts} from "./SPARQLInterface";
import {createValues} from "../function/FunctionCreateVars";
import {initLanguageObject} from "../function/FunctionEditVars";

export async function getVocabulariesFromRemoteJSON(pathToJSON: string, callback: Function) {
    const isURL = require('is-url');
    if (isURL(pathToJSON)) {
        ProjectSettings.status = Locale.loading;
        await fetch(pathToJSON).then(response => response.json()).then(
            async json => {
                for (const key of Object.keys(json)) {
                    let data = json[key];
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
                        let model = await fetchConcepts(
                            data.endpoint,
                            data.sourceIRI,
                            VocabularyElements,
                            true
                        )
                    }
                    Schemes[data.sourceIRI].labels = initLanguageObject(key);
                }
            }
        );
    } else {
        callback(false);
        throw new Error(Locale.vocabularyNotFound)
    }
}