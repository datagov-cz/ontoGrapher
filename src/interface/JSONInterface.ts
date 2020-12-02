import {Links, ProjectSettings, Schemes, Stereotypes} from "../config/Variables";
import {fetchConcepts, getAllTypes, getScheme} from "./SPARQLInterface";
import {createValues} from "../function/FunctionCreateVars";
import {initLanguageObject} from "../function/FunctionEditVars";
import {checkLabels} from "../function/FunctionGetVars";
import {Locale} from "../config/Locale";

export async function getVocabulariesFromRemoteJSON(pathToJSON: string): Promise<boolean> {
    const isURL = require('is-url');
    if (isURL(pathToJSON)) {
        await fetch(pathToJSON).then(response => response.json()).then(
            async json => {
                let results: boolean[] = [];
                if (Object.keys(json).length === 0) return false;
                for (const key of Object.keys(json)) {
                    let data = json[key];
                    if (data.type === "stereotype") {
                        results.push(await getScheme(data.sourceIRI, data.endpoint, data.type === "model"));
                        Schemes[data.sourceIRI].labels = initLanguageObject(key);
                        results.push(await fetchConcepts(
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
                        ));
                        results.push(await fetchConcepts(
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
                        ));
                        checkLabels();
                        for (let link in Links) {
                            Links[link].typesDomain = [];
                            Links[link].typesRange = [];
                            Links[link].subClassOfDomain = [];
                            Links[link].subClassOfRange = [];
                        }
                        results = results.concat(await Promise.all(Object.keys(Stereotypes).map(stereotype =>
                            getAllTypes(
                                stereotype,
                                data.endpoint,
                                Stereotypes[stereotype].types,
                                Stereotypes[stereotype].subClassOf))))
                        results = results.concat(await Promise.all(Object.keys(Links).map(link =>
                            getAllTypes(
                                Links[link].domain,
                                data.endpoint,
                                Links[link].typesDomain,
                                Links[link].subClassOfDomain, true)
                        )))
                        results = results.concat(await Promise.all(Object.keys(Links).map(link =>
                            getAllTypes(
                                Links[link].range,
                                data.endpoint,
                                Links[link].typesRange,
                                Links[link].subClassOfRange, true)
                        )))
                        return results.every(bool => bool);
                    }
                }
            }
        ).catch((error) => {
            console.log(error);
            return false;
        });
        return true;
    } else {
        throw new Error(Locale[ProjectSettings.viewLanguage].vocabularyNotFound)
    }
}