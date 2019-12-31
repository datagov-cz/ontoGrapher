import {Stereotype} from "../components/misc/Stereotype";
import {
    Packages,
    LinkPool, LinkPoolPackage,
    MandatoryAttributePool,
    StereotypePool,
    StereotypePoolPackage,
    VocabularyPool
} from "../config/Variables";
import {AttributeType} from "../components/misc/AttributeType";
import * as Helper from "../misc/Helper";

export function getElementsAsStereotypes(name, jsonData, callback) {
    let query = [
        "SELECT DISTINCT ?term ?termLabel ?termType ?termDefinition",
        "WHERE {",
        "?term <"+jsonData.propertyIRI+"> <"+jsonData.sourceIRI+">.",
        "?term <"+jsonData.labelIRI+"> ?termLabel.",
        "?term a ?termType.",
        "FILTER langMatches(lang(?termLabel),\""+jsonData.language+"\").",
        "FILTER (?termType IN (<"+jsonData.classIRI.join(">,<")+">,<"+jsonData.relationshipIRI.join(">,<")+">)).",
        "OPTIONAL {?term <"+jsonData.definitionIRI+"> ?termDefinition. FILTER langMatches(lang(?termDefinition),\""+jsonData.language+"\").}",
        "}"
    ].join(" ");
    let q = jsonData.endpoint + "?query="+encodeURIComponent(query)+"&format=json";
    fetch(q)
        .then(response => {
            return response.json();
        })
        .then(data => {
            for (let result of data.results.bindings){
                getSubclasses(result.term.value, jsonData,"http://www.w3.org/2000/01/rdf-schema#subPropertyOf",name);
                if (jsonData.classIRI.indexOf(result.termType.value) > -1){
                    Helper.addSTP(new Stereotype(result.termLabel.value,result.term.value,result.termDefinition === undefined ? "" : result.termDefinition.value,name));
                } else if (jsonData.relationshipIRI.indexOf(result.termType.value) > -1) {
                    LinkPool[result.termLabel.value] = ["UnfilledArrow",true,false,[],result.term.value,result.termDefinition === undefined ? "" : result.termDefinition.value,name];
                }
            }
            for (let attribute of jsonData["attributes"]){
                if (!(name in MandatoryAttributePool)){
                    MandatoryAttributePool[name] = [];
                }
                let isArray = Array.isArray(attribute["type"]);
                let atrt = new AttributeType(attribute["name"], attribute["iri"], isArray ? attribute["type"][0] : attribute["type"], isArray);
                MandatoryAttributePool[name].push(atrt);
            }
            VocabularyPool.push(name);
            callback();
        })
        .catch(err => {
            console.log(err);
        })
}

export function getSubclasses(superIRI: string, jsonData, subclassIRI, name){
    let query = [
        "SELECT DISTINCT ?term ?termLabel ?termType ?termDefinition ?scheme",
        "WHERE {",
        "?term <"+subclassIRI+"> <"+superIRI+">.",
        "?term a ?termType.",
        "FILTER (?termType IN (<"+jsonData.classIRI.join(">,<")+">,<"+jsonData.relationshipIRI.join(">,<")+">)).",
        "OPTIONAL {?term <"+jsonData.propertyIRI+"> ?scheme.}",
        "OPTIONAL {?term <"+jsonData.labelIRI+"> ?termLabel. FILTER langMatches(lang(?termLabel),\""+jsonData.language+"\").}",
        "OPTIONAL {?term <"+jsonData.definitionIRI+"> ?termDefinition. FILTER langMatches(lang(?termDefinition),\""+jsonData.language+"\").}",
        "}"
    ].join(" ");
    let q = jsonData.endpoint + "?query="+encodeURIComponent(query)+"&format=json";
    fetch(q)
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.results.bindings.length === 0) return;
            for (let result of data.results.bindings){
                if (result.scheme !== undefined){
                    if (result.scheme.value !== jsonData.sourceIRI) continue;
                }
                let nameLabel = result.termLabel === undefined ?
                           result.term.value.substring(result.term.value.lastIndexOf("/") + 1)
                    :
                        result.termLabel.value
                    ;
                if (jsonData.classIRI.indexOf(result.termType.value) > -1){
                    Helper.addSTP(new Stereotype(nameLabel, result.term.value,result.termDefinition === undefined ? "" : result.termDefinition.value, name));
                } else if (jsonData.relationshipIRI.indexOf(result.termType.value) > -1) {
                    LinkPool[nameLabel] = ["UnfilledArrow",true,false,[],result.term.value,result.termDefinition === undefined ? "" : result.termDefinition.value, name];
                }
            }
        })
        .catch(err => {
            console.log(err);
        })
}

export function getElementsAsPackage(name, jsonData, callback) {

    let query = [
        "SELECT DISTINCT ?term ?termLabel ?termType ?termDefinition",
        "WHERE {",
        "?term <"+jsonData.propertyIRI+"> <"+jsonData.sourceIRI+">.",
        "?term <"+jsonData.labelIRI+"> ?termLabel.",
        "?term a ?termType.",
        "FILTER langMatches(lang(?termLabel),\""+jsonData.language+"\").",
        "FILTER (?termType IN (<"+jsonData.classIRI.join(">,<")+">)).",
        "FILTER (?termType NOT IN (<"+jsonData.relationshipIRI.join(">,<")+">)).",
        "OPTIONAL {?term <"+jsonData.definitionIRI+"> ?termDefinition. FILTER langMatches(lang(?termDefinition),\""+jsonData.language+"\").}",
        "}"
    ].join(" ");
    let q = jsonData.endpoint + "?query="+encodeURIComponent(query)+"&format=json";
    fetch(q)
        .then(response => {
            return response.json();
        })
        .then(data => {
            for (let result of data.results.bindings){
                if (jsonData.classIRI.indexOf(result.termType.value) > -1){
                    if (!(name in StereotypePoolPackage)){
                        StereotypePoolPackage[name] = [];
                    }
                    StereotypePoolPackage[name].push(new Stereotype(result.termLabel.value,result.term.value,result.termDefinition === undefined ? "" : result.termDefinition.value,name));
                }
                // else if (jsonData.relationshipIRI.indexOf(result.termType.value) > -1) {
                //     if (!(name in LinkPoolPackage)){
                //         LinkPoolPackage[name] = [];
                //     }
                //     LinkPoolPackage[result.termLabel.value] = ["Empty",true,false,[],result.term.value,result.termDefinition === undefined ? "" : result.termDefinition.value,name];
                // }
                // for (let attribute of data.attributes){
                //     if (!(name in MandatoryAttributePool)){
                //         MandatoryAttributePool[name] = [];
                //     }
                //     let isArray = Array.isArray(attribute["type"]);
                //     MandatoryAttributePool[name].push(new AttributeType(attribute["name"], attribute["iri"], isArray ? attribute["type"][0] : attribute["type"], isArray))
                // }

            }
            Packages[name] = true;
            callback();
        })
        .catch(err => {
            console.log(err);
        })
}
