import {StereotypePool} from "../config/Variables";

export function fetchStereotypes(source: string, replace: boolean, callback){
    const rdf = require('rdf-ext');
    const rdfFetch = require('rdf-fetch');
    let stereotypes = {};
    rdfFetch(source).then((res) => {
        return res.dataset();
    }).then((dataset) => {
        const classes = dataset.match(null, null, rdf.namedNode("http://www.w3.org/2002/07/owl#Class"));
        let result = {};
        for (let quad of classes.toArray()) {
            if (quad.subject instanceof rdf.defaults.NamedNode) {
                result[quad.subject.value] = dataset.match(rdf.namedNode(quad.subject.value));
            }
        }
        return result;
    }).then((res) => {
        for (let quad in res) {
            for (let node of res[quad].toArray()) {
                if (node.object instanceof rdf.defaults.Literal && node.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label") {
                    if (node.object.language === "en") {
                        stereotypes[node.subject.value] = node.object.value;
                    }
                }
            }
        }

        if (replace){
            for (let stereotype in StereotypePool){
                delete StereotypePool[stereotype];
            }
        }

        for (let stereotype in stereotypes){
            StereotypePool[stereotype] = stereotypes[stereotype];
        }
        callback();
    }).catch((err) => {
        console.error(err.stack || err.message);
    });
}