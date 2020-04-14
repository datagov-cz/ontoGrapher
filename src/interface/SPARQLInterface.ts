import * as Helper from "../misc/Helper";
import {
    Links,
    PropertyPool,
    StereotypeCategories,
    Stereotypes, ModelElements, Schemes, loading
} from "../var/Variables";
import {AttributeType} from "../components/AttributeType";
import {SourceData} from "../components/SourceData";
import * as VariableLoader from "../var/VariableLoader";

export function getLinks(name:string, jsonData: {[key:string]: any}, callback: Function){
    if (!(jsonData.sourceIRI in Schemes)){
        getScheme(jsonData.sourceIRI, jsonData.endpoint, function () {
        });
    }
    // let values: string[] = [];
    // for (let prefix of Object.keys(jsonData.values)){
    //     for (let value of jsonData.values[prefix]){
    //         values.push("<"+jsonData.prefixes[prefix] + value+">");
    //     }
    // }
    let query = [
        "SELECT DISTINCT ?term ?termLabel ?termType ?termDefinition ?skosLabel ?skosDefinition",
        "WHERE {",
        "?term <" + jsonData.propertyIRI + "> <" + jsonData.sourceIRI + ">.",
        "?term <" + jsonData.labelIRI + "> ?termLabel.",
        "?term a ?termType.",
        "?term skos:prefLabel ?skosLabel.",
        "?term skos:definition ?skosDefinition.",
        //"FILTER (?termType IN (<" + jsonData.classIRI.join(">,<") + ">,<" + jsonData.relationshipIRI.join(">,<") + ">)).",
        "FILTER (?termType IN (<" + jsonData.relationshipIRI.join(">,<") + ">)).",
        "OPTIONAL {?term <" + jsonData.definitionIRI + "> ?termDefinition.}",
        "}"
    ].join(" ");
    // if (jsonData.values){
    //     query +=
    //         ["VALUES ?term {",
    //             values.join(" "),
    //             "}",
    //             "}"].join(" ")
    // } else {
    //     query += "}";
    // }
    let q = jsonData.endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
    fetch(q)
        .then(response => {
            return response.json();
        })
        .then(data => {
            for (let result of data.results.bindings) {
                getSubclasses(result.term.value, jsonData, "http://www.w3.org/2000/01/rdf-schema#subPropertyOf", name, callback);
                if (jsonData.relationshipIRI.indexOf(result.termType.value) > -1) {
                        if (result.term.value in Links) {
                            if (result.termLabel !== undefined) Links[result.term.value].labels[result.termLabel['xml:lang']] = result.termLabel.value;
                            if (result.termDefinition !== undefined) Links[result.term.value].definitions[result.termLabel['xml:lang']] = result.termDefinition.value;
                            if (result.skosLabel !== undefined) Links[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                            if (result.skosDefinition !== undefined) Links[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                        } else {
                            Links[result.term.value] = {
                                labels: VariableLoader.initLanguageObject(result.termLabel.value),
                                definitions: VariableLoader.initLanguageObject(result.termDefinition === undefined ? "" : result.termDefinition.value),
                                category: name,
                                skos: {}
                            };
                            Links[result.term.value].skos.prefLabel = {};
                            Links[result.term.value].skos.definition = {};
                            Links[result.term.value].skos.inScheme = jsonData.sourceIRI;
                            if (result.skosLabel !== undefined) Links[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                            if (result.skosDefinition !== undefined) Links[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                        }
                }
            }
            for (let attribute of jsonData["attributes"]) {
                if (!(name in PropertyPool)) {
                    PropertyPool[name] = [];
                }
                let isArray = Array.isArray(attribute["type"]);
                let atrt = new AttributeType(attribute["name"], attribute["iri"], isArray ? attribute["type"][0] : attribute["type"], isArray);
                PropertyPool[name].push(atrt);
            }
            if (!(StereotypeCategories.includes(name))) {
                StereotypeCategories.push(name);
            }
            callback(true);
            loading.loaded++;
        })
        .catch(err => {
            console.log(err);
            callback(false);
        })
}

export function getStereotypes(name: string, jsonData: { [key: string]: any }, callback: Function) {
    if (!(jsonData.sourceIRI in Schemes)){
        getScheme(jsonData.sourceIRI, jsonData.endpoint, function () {
        });
    }
    let values: string[] = [];
    for (let prefix of Object.keys(jsonData.values)){
        for (let value of jsonData.values[prefix]){
            values.push(jsonData.prefixes[prefix] + value);
        }
    }
    let query = [
        "SELECT DISTINCT ?term ?termLabel ?termType ?termDefinition ?skosLabel ?skosDefinition",
        "WHERE {",
        "?term <" + jsonData.propertyIRI + "> <" + jsonData.sourceIRI + ">.",
        "?term <" + jsonData.labelIRI + "> ?termLabel.",
        "?term a ?termType.",
        //"?term skos:prefLabel ?skosLabel.",
        //"?term skos:definition ?skosDefinition.",
        //"FILTER (?termType IN (<" + jsonData.classIRI.join(">,<") + ">,<" + jsonData.relationshipIRI.join(">,<") + ">)).",
        //"FILTER (?termType IN (<" + jsonData.classIRI.join(">,<") + ">)).",
        "OPTIONAL {?term skos:prefLabel ?skosLabel.}",
        "OPTIONAL {?term skos:definition ?skosDefinition.}",
        "OPTIONAL {?term <" + jsonData.definitionIRI + "> ?termDefinition.}",
        "}"
    ].join(" ");
    let q = jsonData.endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
    fetch(q)
        .then(response => {
            return response.json();
        })
        .then(data => {
            for (let result of data.results.bindings) {
                if (jsonData.values) {if (!(values.includes(result.term.value))) continue;}
                getSubclasses(result.term.value, jsonData, "http://www.w3.org/2000/01/rdf-schema#subPropertyOf", name, callback);
               // if (jsonData.classIRI.indexOf(result.termType.value) > -1) {
                    if (result.term.value in Stereotypes) {
                        if (result.termLabel !== undefined) Stereotypes[result.term.value].labels[result.termLabel['xml:lang']] = result.termLabel.value;
                        if (result.termDefinition !== undefined) Stereotypes[result.term.value].definitions[result.termLabel['xml:lang']] = result.termDefinition.value;
                        if (result.skosLabel !== undefined) Stereotypes[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                        if (result.skosDefinition !== undefined) Stereotypes[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                    } else {
                        Helper.addSTP(new SourceData(result.termLabel.value, result.term.value, result.termDefinition === undefined ? "" : result.termDefinition.value, name));
                        Stereotypes[result.term.value].skos.prefLabel = {};
                        Stereotypes[result.term.value].skos.definition = {};
                        Stereotypes[result.term.value].skos.inScheme = jsonData.sourceIRI;
                        if (result.skosLabel !== undefined) Stereotypes[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                        if (result.skosDefinition !== undefined) Stereotypes[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                    }
               // }
            }
            for (let attribute of jsonData["attributes"]) {
                if (!(name in PropertyPool)) {
                    PropertyPool[name] = [];
                }
                let isArray = Array.isArray(attribute["type"]);
                let atrt = new AttributeType(attribute["name"], attribute["iri"], isArray ? attribute["type"][0] : attribute["type"], isArray);
                PropertyPool[name].push(atrt);
            }
            if (!(StereotypeCategories.includes(name))) {
                StereotypeCategories.push(name);
            }
            callback(true);
            loading.loaded++;
        })
        .catch(err => {
            console.log(err);
            callback(false);
        })
}

export function getSubclasses(superIRI: string, jsonData: { [key: string]: any }, subclassIRI: string, name: string, callback:Function) {
    let query = [
        "SELECT DISTINCT ?term ?termLabel ?termType ?termDefinition ?scheme",
        "WHERE {",
        "?term <" + subclassIRI + "> <" + superIRI + ">.",
        "?term a ?termType.",
        "FILTER (?termType IN (<" + jsonData.classIRI.join(">,<") + ">,<" + jsonData.relationshipIRI.join(">,<") + ">)).",
        "OPTIONAL {?term <" + jsonData.propertyIRI + "> ?scheme.}",
        "OPTIONAL {?term <" + jsonData.labelIRI + "> ?termLabel.}",
        "OPTIONAL {?term <" + jsonData.definitionIRI + "> ?termDefinition.}",
        "}"
    ].join(" ");
    let q = jsonData.endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
    fetch(q)
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.results.bindings.length === 0) return;
            loading.load++;
            for (let result of data.results.bindings) {
                if (result.scheme !== undefined) {
                    if (result.scheme.value !== jsonData.sourceIRI) continue;
                }
                if (jsonData.classIRI.indexOf(result.termType.value) > -1) {
                    if (result.term.value in Stereotypes) {
                        if (result.termLabel !== undefined) Stereotypes[result.term.value].labels[result.termLabel['xml:lang']] = result.termLabel.value;
                        if (result.termDefinition !== undefined) Stereotypes[result.term.value].definitions[result.termLabel['xml:lang']] = result.termDefinition.value;
                        if (result.skosLabel !== undefined) Stereotypes[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                        if (result.skosDefinition !== undefined) Stereotypes[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                    } else {
                        Helper.addSTP(new SourceData(result.termLabel.value, result.term.value, result.termDefinition === undefined ? "" : result.termDefinition.value, name));
                        Stereotypes[result.term.value].skos.prefLabel = {};
                        Stereotypes[result.term.value].skos.definition = {};
                        Stereotypes[result.term.value].skos.inScheme = jsonData.sourceIRI;
                        if (result.skosLabel !== undefined) Stereotypes[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                        if (result.skosDefinition !== undefined) Stereotypes[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                    }
                } else if (jsonData.relationshipIRI.indexOf(result.termType.value) > -1) {
                    if (result.term.value in Links) {
                        if (result.termLabel !== undefined) Links[result.term.value].labels[result.termLabel['xml:lang']] = result.termLabel.value;
                        if (result.termDefinition !== undefined) Links[result.term.value].definitions[result.termLabel['xml:lang']] = result.termDefinition.value;
                        if (result.skosLabel !== undefined) Links[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                        if (result.skosDefinition !== undefined) Links[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                    } else {
                        let namelabels = result.termLabel === undefined ? result.term.value.substring(result.term.value.lastIndexOf("/") + 1) : result.termLabel.value;
                        Links[result.term.value] = {
                            labels: VariableLoader.initLanguageObject(namelabels),
                            definitions: VariableLoader.initLanguageObject(result.termDefinition === undefined ? "" : result.termDefinition.value),
                            category: name,
                            skos: {}
                        };
                        Links[result.term.value].skos.prefLabel = {};
                        Links[result.term.value].skos.definition = {};
                        Links[result.term.value].skos.inScheme = jsonData.sourceIRI;
                        if (result.skosLabel !== undefined) Links[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                        if (result.skosDefinition !== undefined) Links[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                    }
                }
            }
            loading.loaded++;
            callback(true);
        })
        .catch(err => {
            callback(false);
            console.log(err);
        })
}

export function getElementsAsPackage(name: string, jsonData: { [key: string]: any }, callback: Function) {
    if (!(jsonData.sourceIRI in Schemes)){
        getScheme(jsonData.sourceIRI, jsonData.endpoint, function () {
        });
    }
    let query = [
        "SELECT DISTINCT ?term ?termLabel ?termType ?termDefinition ?skosLabel ?skosDefinition",
        "WHERE {",
        "?term <" + jsonData.propertyIRI + "> <" + jsonData.sourceIRI + ">.",
        "?term <" + jsonData.labelIRI + "> ?termLabel.",
        "?term a ?termType.",
        "?term skos:prefLabel ?skosLabel.",
        "?term skos:definition ?skosDefinition.",
        "FILTER (?termType IN (<" + jsonData.classIRI.join(">,<") + ">)).",
        "FILTER (?termType NOT IN (<" + jsonData.relationshipIRI.join(">,<") + ">)).",
        "OPTIONAL {?term <" + jsonData.definitionIRI + "> ?termDefinition. }",
        "}"
    ].join(" ");
    let q = jsonData.endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
    fetch(q)
        .then(response => {
            return response.json();
        })
        .then(data => {
            for (let result of data.results.bindings) {
                if (jsonData.classIRI.indexOf(result.termType.value) > -1) {
                    if (result.term.value in ModelElements) {
                        if (result.termLabel !== undefined) ModelElements[result.term.value].labels[result.termLabel['xml:lang']] = result.termLabel.value;
                        if (result.termDefinition !== undefined) ModelElements[result.term.value].definitions[result.termDefinition['xml:lang']] = result.termDefinition.value;
                        if (result.skosLabel !== undefined) ModelElements[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                        if (result.skosDefinition !== undefined) ModelElements[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                    } else {
                        Helper.addModelTP(new SourceData(result.termLabel.value, result.term.value, result.termDefinition === undefined ? "" : result.termDefinition.value, name));
                        ModelElements[result.term.value].skos.prefLabel = {};
                        ModelElements[result.term.value].skos.definition = {};
                        ModelElements[result.term.value].skos.inScheme = jsonData.sourceIRI;
                        if (result.skosLabel !== undefined) ModelElements[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                        if (result.skosDefinition !== undefined) ModelElements[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                    }
                }
            }
            loading.loaded++;
            callback(true);
        })
        .catch(err => {
            callback(false);
            console.log(err);
        })
}

export function getScheme(iri: string, endpoint: string, callback: Function) {
    loading.load++;
    let query = [
        "SELECT DISTINCT ?term ?termLabel ",
        "WHERE {",
        "<" + iri + "> rdfs:label ?termLabel",
        "}"
    ].join(" ");
    let q = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
    fetch(q).then(response => {
        return response.json();
    }).then(data => {
            for (let result of data.results.bindings) {
                if (iri in Schemes){
                    if (result.termLabel !== undefined) Schemes[iri].labels[result.termLabel['xml:lang']] = result.termLabel.value;
                } else {
                    Schemes[iri] = {labels: VariableLoader.initLanguageObject(result.termLabel.value)}
                }
            }
            loading.loaded++;
            callback(true);
        }).catch(e =>{
            callback(false);
            console.log(e);
    })
}