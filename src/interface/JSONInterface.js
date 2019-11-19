import {Locale} from "../config/locale/Locale";
import {getElementsAsPackage, getElementsAsStereotypes} from "./SPARQLinterface";

export function getVocabulariesFromJSONSource(pathToJSON, callback) {
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