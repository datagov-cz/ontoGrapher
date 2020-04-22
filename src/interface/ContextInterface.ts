import {ModelElements, PackageRoot, ProjectSettings, Schemes, Stereotypes, VocabularyElements} from "../var/Variables";
import {graphElement} from "../graph/GraphElement";
import {addClass} from "../misc/Helper";
import {getScheme} from "./SPARQLInterface";
import {PackageNode} from "../components/PackageNode";
import * as Locale from "../locale/LocaleMain.json";

export async function getContext(
    contextIRI: string,
    vocabularyType: string,
    acceptType: string,
    readOnly: string,
    callback: (message: string) => any) {
    callback(Locale.fetchingVocabularies);
    //get vocabularies
    let vocabularyQ = [
        "PREFIX ex: <http://example.org/>",
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
        "select ?vocab (bound(?ro) as ?readOnly) ?labelVocab ?label ?vocabIRI ?import where {",
        "?vocab a <http://example.org/kodi/slovnikovy-kontext> .",
        "?vocab <http://example.org/kodi/obsahuje-slovnik> ?vocabIRI .",
        "ex:mc rdfs:label ?label .",
        "?vocabIRI owl:imports ?import .",
        "?import a skos:ConceptScheme .",
        "?vocabIRI rdfs:label ?labelVocab.",
        "OPTIONAL{",
        "?vocab a  ?ro . FILTER(?ro = <http://example.org/kodi/pouze-pro-cteni>) .",
        "}",
        "}",
    ].join(" ");
    let vocabularyQurl = contextIRI + "?query=" + encodeURIComponent(vocabularyQ);
    let responseInit: {}[] = await fetch(vocabularyQurl,
        {headers: {'Accept': acceptType}})
        .then((response) => response.json())
        .then((data) => {
            return data.results.bindings;
        });
    let vocabularies: {[key: string]: {names: {[key:string]: string}, readOnly : boolean, terms: any}} = {};
    responseInit.forEach((result:{[key:string]:any})=>{
        if (!(result.import.value in vocabularies)){
            vocabularies[result.import.value] = {readOnly: result.readOnly.value === "true", names: {}, terms: {}};
        }
        vocabularies[result.import.value].names[result.labelVocab["xml:lang"]] = result.labelVocab.value;
        ProjectSettings.name[result.label["xml:lang"]] = result.label.value;
    });
    //load terms
    callback(Locale.loadingTerms);
    for (let vocab in vocabularies) {
        if (!(vocab in Schemes)) getScheme(vocab, contextIRI, function () {});
        let termQ = [
            "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
            "SELECT DISTINCT ?term ?termType ?skosLabel ?skosDefinition",
            "WHERE {",
            "?term skos:inScheme <" + vocab + ">.",
            "?term a ?termType.",
            "OPTIONAL {?term skos:prefLabel ?skosLabel.}",
            "OPTIONAL {?term skos:definition ?skosDefinition.}",
            "}"
        ].join(" ");
        let termsQuery = contextIRI + "?query=" + encodeURIComponent(termQ);
        let termsResult = await fetch(termsQuery,
            {headers: {'Accept': acceptType}})
            .then((response) => response.json())
            .then((data) => {
                return data.results.bindings;
        });
        for (let result of termsResult){
            if (result.term.value in vocabularies[vocab].terms) {
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
            } else {
                vocabularies[vocab].terms[result.term.value] = {};
                vocabularies[vocab].terms[result.term.value].iri = [];
                vocabularies[vocab].terms[result.term.value].labels = {};
                vocabularies[vocab].terms[result.term.value].definitions = {};
                vocabularies[vocab].terms[result.term.value].skos = {};
                vocabularies[vocab].terms[result.term.value].skos.prefLabel = {};
                vocabularies[vocab].terms[result.term.value].skos.definition = {};
                vocabularies[vocab].terms[result.term.value].skos.inScheme = vocab;
                vocabularies[vocab].terms[result.term.value].category = vocab;
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
            }
        }
        //put into packages
        if (!vocabularies[vocab].readOnly) {
            Object.assign(VocabularyElements, vocabularies[vocab].terms);
            let pkg = new PackageNode(vocabularies[vocab].names["cs"], PackageRoot, false, vocab);
            for (let elem in vocabularies[vocab].terms) {
                let id = new graphElement().id;
                if (typeof id === "string") {
                    addClass(id, vocabularies[vocab].terms[elem].iri, "cs", vocab, pkg, false, false, vocabularies[vocab].terms[elem].labels, vocabularies[vocab].terms[elem].definitions);
                }
            }
            PackageRoot.children.push(pkg);
        } else {
            Object.assign(ModelElements, vocabularies[vocab].terms);
        }
    }
}