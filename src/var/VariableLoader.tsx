import * as LanguageJSON from '../config/Languages.json';
import {Languages} from "./Variables";

export function initVars(){
    loadLanguages();
}

export function loadLanguages(){
    for (let [code, name] of Object.entries(LanguageJSON)){
        Languages[code] = name;
    }
}