import * as Locale from "./../locale/LocaleMain.json";
import {getElementsAsModel, getLinks, getStereotypes} from "./SPARQLInterface";
import {loading} from "../var/Variables";

export async function getVocabulariesFromJSONSource(pathToJSON: string, callback: Function) {
    const isURL = require('is-url');
    if (isURL(pathToJSON)) {
        await fetch(pathToJSON).then(response => response.json()).then(
            async json => {
                for (const key of Object.keys(json)) {
                    let type = json[key]["type"];
                    if (type === "stereotype"){
                        loading.load++;
                        await getStereotypes(key, json[key], callback);
                        await getLinks(key, json[key], callback);
                    } else if (type === "model"){
                        loading.load++;
                        await getElementsAsModel(key, json[key], callback);
                    }
                }
            }
        );
    } else {
        callback(false);
        throw new Error(Locale.vocabularyNotFound)
    }
}