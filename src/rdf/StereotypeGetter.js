import {Defaults} from "../config/Defaults";
import * as DataFactoryExt from "rdf-ext";

export function getStereotypes(){

    const rdf = require('rdf-ext');
    const rdfFetch = require('rdf-fetch');
    let result;

    rdfFetch(Defaults.stereotypeUrl).then((res) => {
        console.log(res);
        return res.dataset();
    }).then((dataset) => {
        console.log(dataset);
        const classes = dataset.match(null,null,rdf.namedNode("http://www.w3.org/2002/07/owl#Class"));
        console.log(searchArray);
        return searchArray;
    }).then((res)=>{
        for (let quad of res){
            if (quad.subject instanceof DataFactoryExt.defaults.NamedNode){
                console.log(quad.subject.value);
            }

        }
    }).catch((err) => {
        console.error(err.stack || err.message);
    });
}