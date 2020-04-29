import * as Locale from "./../locale/LocaleMain.json";
import {getLinks, getStereotypes, getVocabularyElements} from "./SPARQLInterface";
import {ProjectSettings} from "../config/Variables";

export async function getVocabulariesFromRemoteJSON(pathToJSON: string, callback: Function) {
    const isURL = require('is-url');
    if (isURL(pathToJSON)) {
        ProjectSettings.status = Locale.loading;
        await fetch(pathToJSON).then(response => response.json()).then(
            async json => {
                for (const key of Object.keys(json)) {
                    let type = json[key]["type"];
                    if (type === "stereotype") {
                        await getStereotypes(key, json[key], callback);
                        await getLinks(key, json[key], callback);
                    } else if (type === "model") {
                        await getVocabularyElements(key, json[key], callback);
                    }
                }
            }
        );
    } else {
        callback(false);
        throw new Error(Locale.vocabularyNotFound)
    }
}