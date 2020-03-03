import * as Locale from "./../locale/LocaleMain.json";
import {getElementsAsPackage, getElementsAsStereotypes} from "./SPARQLInterface";

export function getVocabulariesFromJSONSource(pathToJSON: string, callback: Function) {
    const isURL = require('is-url');
    if (isURL(pathToJSON)) {
        fetch(pathToJSON).then(response => response.json()).then(
            json => {
                Object.keys(json).forEach(key => {
                    let type = json[key]["type"];
                    if (type === "stereotype"){
                        getElementsAsStereotypes(key, json[key], callback);
                    } else if (type === "model"){
                        getElementsAsPackage(key, json[key], callback);
                    }

                })
            }
        );
    } else {
        throw new Error(Locale.vocabularyNotFound)
    }

    callback();
}