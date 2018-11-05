import {Defaults} from "../config/Defaults";

export function getStereotypes(callback){

    let stereotypes = {};

    const rdf = require('rdf-ext');
    const rdfFetch = require('rdf-fetch');

    rdfFetch(Defaults.stereotypeUrl).then((res) => {
        console.log(res);
        return res.dataset();
    }).then((dataset) => {
        console.log(dataset);
        const classes = dataset.match(null,null,rdf.namedNode("http://www.w3.org/2002/07/owl#Class"));
        let result = {};
        for (let quad of classes.toArray()){
            if (quad.subject instanceof rdf.defaults.NamedNode){
                result[quad.subject.value] = dataset.match(rdf.namedNode(quad.subject.value));
            }
        }
        return result;
    }).then((res)=>{
        console.log(res);
        for (let quad in res){
            for (let node of res[quad].toArray()){
                if (node.object instanceof rdf.defaults.Literal && node.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label"){
                    if (node.object.language === "en"){
                        stereotypes[node.subject.value] = node.object.value;
                    }
                }
            }
        }
        callback(stereotypes);
    }).catch((err) => {
        console.error(err.stack || err.message);
    });
}

