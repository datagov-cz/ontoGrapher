import * as Locale from "./../locale/LocaleMain.json";
import {Links, ProjectSettings, Stereotypes, VocabularyElements} from "../config/Variables";
import {fetchConcepts} from "./SPARQLInterface";
import {createValues} from "../function/FunctionCreateVars";

export async function getVocabulariesFromRemoteJSON(pathToJSON: string, callback: Function) {
    const isURL = require('is-url');
    if (isURL(pathToJSON)) {
        ProjectSettings.status = Locale.loading;
        await fetch(pathToJSON).then(response => response.json()).then(
            async json => {
                for (const key of Object.keys(json)) {
                    let data = json[key];
                    if (data.type === "stereotype") {
                        let stereotypes = await fetchConcepts(
                            data.endpoint,
                            data.sourceIRI,
                            false,
                            undefined,
                            undefined,
                            [data.classIRI],
                            data.values ? createValues(data.values, data.prefixes) : undefined
                            );
                        let links = await fetchConcepts(
                            data.endpoint,
                            data.sourceIRI,
                            false,
                            undefined,
                            undefined,
                            [data.relationshipIRI],
                            data.values ? createValues(data.values, data.prefixes) : undefined
                            );
                        Object.assign(Links, links);
                        Object.assign(Stereotypes, stereotypes);
                    } else if (data.type === "model") {
                        let model = await fetchConcepts(
                            data.endpoint,
                            data.sourceIRI,
                            true
                        )
                        Object.assign(VocabularyElements, model);
                    }

                }
            }
        );
    } else {
        callback(false);
        throw new Error(Locale.vocabularyNotFound)
    }
}