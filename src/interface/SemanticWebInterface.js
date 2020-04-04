import {
    AttributeTypePool,
    GeneralizationPool,
    Languages,
    LinkPool,
    Links,
    StereotypeCategories,
    VocabularyPool
} from "../var/Variables";
import * as Locale from "../locale/LocaleMain.json";
import {SourceData} from "../components/SourceData";
import {isBlankNode} from "n3/lib/N3Util";
import * as Helper from "../misc/Helper";
import * as VariableLoader from "../var/VariableLoader";

export function fetchClasses(name, source, typeIRI, replace, language, callback) {
    const N3 = require('n3');
    const parser = new N3.Parser();
    let result;
    if (!(VocabularyPool.includes(name))){
        VocabularyPool.push(name);
    }
    fetch(source).then(
        (src)=>{
            return src.text()}).then((text) => {
        return parser.parse(text);
    }).then((res) => {
        for (let quad of res){
            if (!isBlankNode(quad.subject)){
                if(!(quad.subject.value in result)){
                    result[quad.subject.value] = {"class": false};
                }
                const predicate = quad.predicate.value;

                switch(predicate) {
                    case "http://www.w3.org/1999/02/22-rdf-syntax-ns#type":
                        if (quad.object.value === typeIRI){
                            result[quad.subject.value]["class"] = true;
                        }
                        break;
                    case "http://www.w3.org/2000/01/rdf-schema#label":
                        result[quad.subject.value]["label"] = quad.object.value;
                        break;
                }
            }
        }
        for (let key in result){
            if (result[key].class){
                Helper.addSTP(new SourceData(result[key].label,key,"", name));
            }
        }
        callback();
    }).catch((err) => {
        console.error(err.stack || err.message);
    });
}

export function fetchRelationships(name, source, typeIRI, replace, language, callback) {
    const N3 = require('n3');
    const parser = new N3.Parser();
    let result = {};
    if (!(VocabularyPool.includes(name))){
        VocabularyPool.push(name);
    }
    fetch(source).then(
        (src)=>{
            return src.text()}).then((text) => {
        return parser.parse(text);
    }).then((res) => {
        for (let quad of res){
            if (!isBlankNode(quad.subject)){
                if(!(quad.subject.value in result)){
                    result[quad.subject.value] = {"relationship": false};
                }
                const predicate = quad.predicate.value;

                switch(predicate) {
                    case "http://www.w3.org/1999/02/22-rdf-syntax-ns#type":
                        if (quad.object.value === typeIRI){
                            result[quad.subject.value]["relationship"] = true;
                        }
                    case "http://www.w3.org/2000/01/rdf-schema#label":
                        result[quad.subject.value]["label"] = quad.object.value;
                }
            }
        }
        for (let key in result){
            if (result[key].relationship){
                // LinkPool[result[key].label]=["Empty",true,false,[],key,"",""];
                Links[key] = {
                    labels: VariableLoader.initLanguageObject(result[key].label),
                    descriptions: VariableLoader.initLanguageObject(""),
                    category: name
                }
            }
        }
        if (!(StereotypeCategories.includes(name))){
            StereotypeCategories.push(name);
        }
        callback();
    }).catch((err) => {
        console.error(err.stack || err.message);
    });
}


//relationships[node.object.value] = ["Empty", true, false, [], node.subject.value,"",""];


