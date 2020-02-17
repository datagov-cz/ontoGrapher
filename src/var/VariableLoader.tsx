import {Languages} from "./Variables";

export function initVars(){
    loadLanguages();
}

export function loadLanguages(){
    const json = require('../config/Languages.json');
    for (let code in json){
        Languages[code] = json[code];
    }
}