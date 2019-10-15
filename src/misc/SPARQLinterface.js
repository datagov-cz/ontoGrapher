import {Defaults} from "../diagram/Defaults";
import {Stereotype} from "../components/misc/Stereotype";
import {AttributeTypePool, StereotypePool} from "../config/Variables";
import {LinkPool} from "../config/LinkVariables";

export function getElements(endpoint: string, typeIRI: string, classIRI: string, callback) {

    let query = [
        "SELECT ?term ?termLabel ?termType ?termDefinition",
        "WHERE {",
        "?term <"+typeIRI+"> <"+classIRI+">.",
        "?term <http://www.w3.org/2004/02/skos/core#prefLabel> ?termLabel.",
        "?term a ?termType.",
        "?term <http://www.w3.org/2004/02/skos/core#definition> ?termDefinition.",
        "FILTER langMatches(lang(?termLabel),\""+Defaults.language+"\").",
        "FILTER langMatches(lang(?termDefinition),\""+Defaults.language+"\").",
        "FILTER (?termType IN (<"+Defaults.stereotypeIRI.join(">,<")+">,<"+Defaults.relationshipIRI.join(">,<")+">,<"+Defaults.attributeIRI.join(">,<")+">)).",
        "}"
    ].join(" ");

    let q = endpoint + "?query="+encodeURIComponent(query)+"&format=json";

    fetch(q)
        .then(response => {
            return response.json()
        })
        .then(data => {

            for (let result of data.results.bindings){
                if (Defaults.stereotypeIRI.indexOf(result.termType.value) > -1){
                    StereotypePool.push(new Stereotype(result.termLabel.value,result.term.value,result.termDefinition.value));
                } else if (Defaults.relationshipIRI.indexOf(result.termType.value) > -1) {
                    LinkPool[result.termLabel.value] = ["Empty",true,false,[],result.term];
                } else if (Defaults.attributeIRI.indexOf(result.termType.value) > -1) {
                    AttributeTypePool.push(result.termLabel.value);
                }
            }
            callback();
        })
        .catch(err => {
            console.log(err);
        })
}