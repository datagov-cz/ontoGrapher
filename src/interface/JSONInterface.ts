import * as Locale from "./../locale/LocaleMain.json";
import {Links, Schemes, Stereotypes} from "../config/Variables";
import {fetchConcepts, getScheme} from "./SPARQLInterface";
import {createValues} from "../function/FunctionCreateVars";
import {initLanguageObject} from "../function/FunctionEditVars";
import {checkLabels} from "../function/FunctionGetVars";

export async function getVocabulariesFromRemoteJSON(pathToJSON: string): Promise<boolean> {
    const isURL = require('is-url');
    if (isURL(pathToJSON)) {
        await fetch(pathToJSON).then(response => response.json()).then(
            async json => {
                for (const key of Object.keys(json)) {
                    let data = json[key];
                    if (data.type === "stereotype") {
                        await getScheme(data.sourceIRI, data.endpoint, data.type === "model");
                        Schemes[data.sourceIRI].labels = initLanguageObject(key);
                        await fetchConcepts(
                            data.endpoint,
                            data.sourceIRI,
                            Stereotypes,
                            false,
                            undefined,
                            false,
                            undefined,
                            true,
                            [data.classIRI],
                            data.values ? createValues(data.values, data.prefixes) : undefined
                        );
                        await fetchConcepts(
                            data.endpoint,
                            data.sourceIRI,
                            Links,
                            false,
                            undefined,
                            false,
                            undefined,
                            true,
                            [data.relationshipIRI],
                            data.values ? createValues(data.values, data.prefixes) : undefined
                        );
                        checkLabels();
                        // for (let link in Links) {
                        //     Links[link].typesDomain = [];
                        //     Links[link].typesRange = [];
                        //     Links[link].subClassOfDomain = [];
                        //     Links[link].subClassOfRange = [];
                        // }
                        // await Promise.all(Object.keys(Stereotypes).map(stereotype =>
                        //     getAllTypes(
                        //         stereotype,
                        //         data.endpoint,
                        //         Stereotypes[stereotype].types,
                        //         Stereotypes[stereotype].subClassOf)))
                        // await Promise.all(Object.keys(Links).map(link => {
                        //     if (Links[link].domain && Links[link].domain !== "") getAllTypes(
                        //         Links[link].domain,
                        //         data.endpoint,
                        //         Links[link].typesDomain,
                        //         Links[link].subClassOfDomain, true)
                        // }))
                        // await Promise.all(Object.keys(Links).map(link => {
                        //     if (Links[link].range && Links[link].range !== "") getAllTypes(
                        //         Links[link].range,
                        //         data.endpoint,
                        //         Links[link].typesRange,
                        //         Links[link].subClassOfRange, true)
                        // }))
                    }
                }
            }
        ).catch((error) => {
            console.log(error);
            return false;
        });
        return true;
    } else {
        throw new Error(Locale.vocabularyNotFound)
    }
}