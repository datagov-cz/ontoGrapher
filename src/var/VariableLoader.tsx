import {Languages, ProjectSettings} from "./Variables";
import * as Locale from "./../locale/LocaleMain.json";

export function initVars(){
    loadLanguages();
    initProjectSettings();
}

export function loadLanguages(){
    const json = require('../config/Languages.json');
    for (let code in json){
        Languages[code] = json[code];
    }
}

export function initProjectSettings(){
    ProjectSettings.name = initLanguageObject(Locale.untitledProject);
    ProjectSettings.description = initLanguageObject("");
    ProjectSettings.selectedDiagram = 0;
}

export function initLanguageObject(defaultString: string){
    let result: {[key:string]: string} = {};
    for (let code in Languages){
        result[code] = defaultString;
    }
    return result;
}