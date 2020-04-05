import * as Locale from "./../locale/LocaleMain.json";
import {getElementsAsPackage, getLinks, getStereotypes} from "./SPARQLInterface";
import {loading} from "../var/Variables";

export function getVocabulariesFromJSONSource(pathToJSON: string, callback: Function) {
    const isURL = require('is-url');
    if (isURL(pathToJSON)) {
        fetch(pathToJSON).then(response => response.json()).then(
            json => {
                Object.keys(json).forEach(key => {
                    let type = json[key]["type"];
                    if (type === "stereotype"){
                        loading.load++;
                        getStereotypes(key, json[key], callback);
                        getLinks(key, json[key], callback);
                    } else if (type === "model"){
                        loading.load++;
                        getElementsAsPackage(key, json[key], callback);
                    }
                })
            }
        );
    } else {
        callback(false);
        throw new Error(Locale.vocabularyNotFound)
    }
}