import {ModelElements, PackageRoot, ProjectSettings, Schemes, Stereotypes, VocabularyElements} from "../config/Variables";
import {graphElement} from "../graph/GraphElement";
import {addClass} from "../function/Helper";
import {getScheme} from "./SPARQLInterface";
import {PackageNode} from "../components/PackageNode";
import * as Locale from "../locale/LocaleMain.json";

export async function testContext(contextIRI: string, contextEndpoint: string) {
    let vocabularyQ = [
        "PREFIX ex: <http://example.org/>",
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
        "select ?vocab ?label ?vocabIRI where {",
        "BIND(<" + contextIRI + "> as ?contextIRI) .",
        "?contextIRI rdfs:label ?label;",
        "<https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-kontext> ?vocab.",
        "?vocab a ?vocabType.",
        "VALUES ?vocabType {",
        "<https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext>",
        "<https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext-pouze-pro-čtení>",
        "}",
        "?vocab <https://slovník.gov.cz/datový/pracovní-prostor/pojem/obsahuje-slovník> ?vocabIRI .",
        "?vocabIRI owl:imports ?import .",
        "?import a skos:ConceptScheme .",
        "}",
    ].join(" ");
    //keep this .log
    console.log(vocabularyQ);
    let result: { labels: string[], imports: string[], error: any } = {labels: [], imports: [], error: undefined};
    let vocabularyQurl = contextEndpoint + "?query=" + encodeURIComponent(vocabularyQ);
    let response: {}[] = await fetch(vocabularyQurl,
        {headers: {'Accept': 'application/json'}})
        .then((response) => response.json())
        .then((data) => {
            return data.results.bindings;
        }).catch((error) => {
            console.log(error);
            result.error = error;
        });
    if (result.error) return result;
    else {
        response.forEach((res: { [key: string]: any }) => {
            if (!(result.labels.includes(res.label.value))) result.labels.push(res.label.value);
            if (!(result.imports.includes(res.vocabIRI.value))) result.imports.push(res.vocabIRI.value);
        });
        return result;
    }
}

export async function getContext(
    contextIRI: string,
    contextEndpoint: string,
    acceptType: string,
    callback: (message: string) => any) {
    callback(Locale.fetchingVocabularies);
    //get vocabularies
    let vocabularyQ = [
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "select ?vocab (bound(?ro) as ?readOnly) ?labelVocab ?label ?vocabIRI ?import",
        "where {",
        "BIND(<" + contextIRI + "> as ?contextIRI) .",
        "?contextIRI rdfs:label ?label;",
        "<https://slovník.gov.cz/datový/pracovní-prostor/pojem/odkazuje-na-kontext> ?vocab.",
        "?vocab a ?vocabType .",
        "VALUES ?vocabType { <https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext> <https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext-pouze-pro-čtení> }",
        "?vocab <https://slovník.gov.cz/datový/pracovní-prostor/pojem/obsahuje-slovník> ?vocabIRI .",
        "?vocabIRI owl:imports ?import .",
        "?import a skos:ConceptScheme .",
        "?import rdfs:label ?labelVocab.",
        "OPTIONAL{ ?vocab a  ?ro . FILTER(?ro = <https://slovník.gov.cz/datový/pracovní-prostor/pojem/slovníkový-kontext-pouze-pro-čtení>) .  }",
        "}",
    ].join(" ");
    let vocabularyQurl = contextEndpoint + "?query=" + encodeURIComponent(vocabularyQ);
    let responseInit: {}[] = await fetch(vocabularyQurl,
        {headers: {'Accept': acceptType}})
        .then((response) => response.json())
        .then((data) => {
            return data.results.bindings;
        });
    let vocabularies: { [key: string]: { names: { [key: string]: string }, readOnly: boolean, terms: any } } = {};
    responseInit.forEach((result: { [key: string]: any }) => {
        if (!(result.import.value in vocabularies)) {
            vocabularies[result.import.value] = {readOnly: result.readOnly.value === "true", names: {}, terms: {}};
        }
        vocabularies[result.import.value].names[result.labelVocab["xml:lang"]] = result.labelVocab.value;
        ProjectSettings.name[result.label["xml:lang"]] = result.label.value;
    });
    //load terms
    callback(Locale.loadingTerms);
    for (let vocab in vocabularies) {
        if (!(vocab in Schemes)) getScheme(vocab, contextEndpoint, function () {
        });
        let termQ = [
            "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
            "SELECT DISTINCT ?term ?termType ?skosLabel ?skosDefinition ?domain ?range",
            "WHERE {",
            "?term skos:inScheme <" + vocab + ">.",
            "?term a ?termType.",
            "OPTIONAL {?term skos:prefLabel ?skosLabel.}",
            "OPTIONAL {?term skos:definition ?skosDefinition.}",
            "OPTIONAL {?term rdfs:range ?range.}",
            "OPTIONAL {?term rdfs:domain ?domain.}",
            "}"
        ].join(" ");
        let termsQuery = contextEndpoint + "?query=" + encodeURIComponent(termQ);
        let termsResult = await fetch(termsQuery,
            {headers: {'Accept': acceptType}})
            .then((response) => response.json())
            .then((data) => {
                return data.results.bindings;
            });
        for (let result of termsResult) {
            if (!(result.term.value in vocabularies[vocab].terms)){
                vocabularies[vocab].terms[result.term.value] = {};
                vocabularies[vocab].terms[result.term.value].iri = [];
                vocabularies[vocab].terms[result.term.value].labels = {};
                vocabularies[vocab].terms[result.term.value].definitions = {};
                vocabularies[vocab].terms[result.term.value].skos = {};
                vocabularies[vocab].terms[result.term.value].skos.prefLabel = {};
                vocabularies[vocab].terms[result.term.value].skos.definition = {};
                vocabularies[vocab].terms[result.term.value].skos.inScheme = vocab;
                vocabularies[vocab].terms[result.term.value].category = vocab;
                vocabularies[vocab].terms[result.term.value].domainOf = [];
            }
            if (result.skosLabel !== undefined) {
                vocabularies[vocab].terms[result.term.value].skos.prefLabel[result.skosLabel['xml:lang']] = result.skosLabel.value;
                vocabularies[vocab].terms[result.term.value].labels[result.skosLabel['xml:lang']] = result.skosLabel.value;
            }
            if (result.skosDefinition !== undefined) {
                vocabularies[vocab].terms[result.term.value].skos.definition[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
                vocabularies[vocab].terms[result.term.value].definitions[result.skosDefinition['xml:lang']] = result.skosDefinition.value;
            }
            if (result.termType !== undefined && result.termType.value in Stereotypes && !(vocabularies[vocab].terms[result.term.value].iri.includes(result.termType.value))) {
                vocabularies[vocab].terms[result.term.value].iri.push(result.termType.value);
            }
            if (result.domain !== undefined) {
                vocabularies[vocab].terms[result.term.value].domain = result.domain.value;
            }
            if (result.range !== undefined) vocabularies[vocab].terms[result.term.value].range = result.range.value;
        }
        //put into packages
        if (!vocabularies[vocab].readOnly) {
            Object.assign(VocabularyElements, vocabularies[vocab].terms);
            let pkg = new PackageNode(vocabularies[vocab].names["cs"], PackageRoot, false, vocab);
            for (let elem in vocabularies[vocab].terms) {
                let id = new graphElement().id;
                if (typeof id === "string") {
                    addClass(id, vocabularies[vocab].terms[elem].iri, "cs", vocab, pkg, false, false, vocabularies[vocab].terms[elem].labels, vocabularies[vocab].terms[elem].definitions, elem);
                }
            }
            PackageRoot.children.push(pkg);
        } else {
            Object.assign(ModelElements, vocabularies[vocab].terms);
        }
    }
}