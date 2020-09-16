import {DataFactory} from "n3";
import {
    Prefixes,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Schemes,
    Stereotypes,
    VocabularyElements
} from "../config/Variables";
import {parsePrefix} from "./FunctionEditVars";
import {Locale} from "../config/Locale";

export function exportModel(iri: string, type: string, knowledgeStructure: string, ksShort: string, callback: Function) {
    const N3 = require('n3');
    const {namedNode, literal} = DataFactory;
    const writer = new N3.Writer({prefixes: Prefixes});
    let name: string = ProjectSettings.name[Object.keys(ProjectSettings.name)[0]].trim().replace(/\s/g, '-');
    let projectIRI = iri + ksShort + "/" + name;
    let project = namedNode(projectIRI);
    let termObj: { [key: string]: string } = {};
    //type -zsgovmodel, ontology
    writer.addQuad(project, namedNode(parsePrefix("rdf", "type")), namedNode(parsePrefix("owl", "Ontology")));
    writer.addQuad(project, namedNode(parsePrefix("rdf", "type")), namedNode(parsePrefix("z-sgov-pojem", "model")));
    writer.addQuad(project, namedNode(parsePrefix("rdf", "type")), namedNode(knowledgeStructure));
    //label
    for (let lang of Object.keys(ProjectSettings.name)) {
        if (ProjectSettings.name[lang].length > 0) {
            writer.addQuad(project, namedNode(parsePrefix("skos", "prefLabel")), literal(ProjectSettings.name[lang], lang));
        }
    }
    //imports
    for (let iri of Object.keys(Schemes)) {
        writer.addQuad(project, namedNode(parsePrefix("owl", "imports")), namedNode(iri));
    }

    for (let id of Object.keys(ProjectElements)) {
        let iri = ProjectElements[id].iri;
        if (Array.isArray(ProjectElements[id].iri)) {
            let cont = false;
            for (let iri of ProjectElements[id].iri) {
                if (iri in Stereotypes) {
                    cont = true;
                }
            }
            if (!cont) continue;
        } else {
            if (!((iri) in Stereotypes)) continue;
        }
        let elementName = Object.values(VocabularyElements[ProjectElements[id].iri].labels)[0];
        for (let lang of Object.keys(VocabularyElements[ProjectElements[id].iri].labels)) {
            if (VocabularyElements[ProjectElements[id].iri].labels[lang].length > 0) {
                elementName = VocabularyElements[ProjectElements[id].iri].labels[lang];
                break;
            }
        }
        let stereotypeIRI = Array.isArray(ProjectElements[id].iri) ? ProjectElements[id].iri[0] : ProjectElements[id].iri;
        if (elementName === "") elementName = (Locale[ProjectSettings.selectedLanguage].untitled + "-" + Stereotypes[stereotypeIRI].labels[Object.keys(Stereotypes[stereotypeIRI].labels)[0]]).trim().replace(/\s/g, '-');
        elementName = (projectIRI + "/pojem/" + elementName).trim().replace(/\s/g, '-');
        let count = 1;
        if (Object.values(termObj).includes(elementName)) {
            while (Object.values(termObj).includes(elementName + "-" + count.toString(10))) {
                count++;
            }
            elementName += "-" + count.toString(10);
        }
        termObj[id] = elementName;
    }

    for (let id of Object.keys(termObj)) {
        let subject = namedNode(termObj[id]);
        //type
        //writer.addQuad(subject, namedNode(parsePrefix(Prefixes.rdf,"type")), namedNode(parsePrefix(Prefixes.skos,"Concept")));
        if (Array.isArray(ProjectElements[id].iri)) {
            for (let iri of ProjectElements[id].iri) {
                writer.addQuad(subject, namedNode(parsePrefix("rdf", "type")), namedNode(iri));
            }
        } else {
            writer.addQuad(subject, namedNode(parsePrefix("rdf", "type")), namedNode(ProjectElements[id].iri));
        }

        //prefLabel
        if (!(ProjectElements[id].untitled)) {
            for (let lang of Object.keys(VocabularyElements[ProjectElements[id].iri].labels)) {
                if (VocabularyElements[ProjectElements[id].iri].labels[lang].length > 0) {
                    writer.addQuad(subject, namedNode(parsePrefix("skos", "prefLabel")), literal(VocabularyElements[ProjectElements[id].iri].labels[lang], lang));
                }
            }
        }
        //rdfs:isDefinedBy
        writer.addQuad(subject, namedNode(parsePrefix("rdfs", "isDefinedBy")), project);
        //relationships
        for (let conn of ProjectElements[id].connections) {
            let targetIRI = termObj[ProjectLinks[conn].target];
            let predicateIRI = ProjectLinks[conn].iri;
            let length = 0;
            let pref = "";
            for (let prefix of Object.keys(Prefixes)) {
                if (predicateIRI.startsWith(Prefixes[prefix])) {
                    if (Prefixes[prefix].length > length) {
                        length = Prefixes[prefix].length;
                        pref = prefix;
                    }
                }
            }
            if (length > 0) predicateIRI = pref + ":" + predicateIRI.substring(length);
            writer.addQuad(subject, namedNode(predicateIRI), namedNode(targetIRI));
        }
    }
    return writer.end((error: any, result: any) => {
        callback(result);
    })
}

export function exportGlossary(iri: string, type: string, knowledgeStructure: string, ksShort: string, callback: Function) {
    const N3 = require('n3');
    const {namedNode, literal} = DataFactory;
    const writer = new N3.Writer({prefixes: Prefixes});
    let termObj: { [key: string]: string } = {};
    let name: string = ProjectSettings.name[Object.keys(ProjectSettings.name)[0]].trim().replace(/\s/g, "-");
    let glossaryIRI = iri + ksShort + "/" + name;
    let glossary = namedNode(glossaryIRI);
    writer.addQuad(glossary, namedNode(parsePrefix("rdf", "type")), namedNode("z-sgov-pojem:glosář"));
    writer.addQuad(glossary, namedNode(parsePrefix("rdf", "type")), namedNode(parsePrefix("skos", "ConceptScheme")));
    writer.addQuad(glossary, namedNode(parsePrefix("rdf", "type")), namedNode(knowledgeStructure));
    for (let lang of Object.keys(ProjectSettings.name)) {
        if (ProjectSettings.name[lang].length > 0) {
            writer.addQuad(glossary, namedNode(parsePrefix("skos", "prefLabel")), literal(ProjectSettings.name[lang], lang));
        }
    }
    //imports
    for (let iri of Object.keys(Schemes)) {
        writer.addQuad(glossary, namedNode(parsePrefix("owl", "imports")), namedNode(iri));

        let scheme = namedNode(iri);
        writer.addQuad(scheme, namedNode(parsePrefix("rdf", "type")), namedNode("z-sgov-pojem:glosář"));
        writer.addQuad(scheme, namedNode(parsePrefix("rdf", "type")), namedNode(parsePrefix("skos", "ConceptScheme")));
        writer.addQuad(scheme, namedNode(parsePrefix("rdf", "type")), namedNode(knowledgeStructure));
        for (let lang of Object.keys(ProjectSettings.name)) {
            if (ProjectSettings.name[lang].length > 0) {
                writer.addQuad(scheme, namedNode(parsePrefix("skos", "prefLabel")), literal(ProjectSettings.name[lang], lang));
            }
        }
    }

    for (let id of Object.keys(ProjectElements)) {
        let iri = ProjectElements[id].iri;
        if (!((iri) in Stereotypes)) continue;
        let elementName = VocabularyElements[ProjectElements[id].iri].labels[Object.keys(VocabularyElements[ProjectElements[id].iri].labels)[0]]
        for (let lang of Object.keys(VocabularyElements[ProjectElements[id].iri].labels)) {
            if (VocabularyElements[ProjectElements[id].iri].labels[lang].length > 0) {
                elementName = VocabularyElements[ProjectElements[id].iri].labels[lang];
                break;
            }
        }
        if (elementName === "") elementName = (Locale[ProjectSettings.selectedLanguage].untitled + "-" + Stereotypes[iri].labels[Object.keys(Stereotypes[iri].labels)[0]]).trim().replace(/\s/g, '-');
        elementName = (glossaryIRI + "/pojem/" + elementName).trim().replace(/\s/g, '-');
        let count = 1;
        if (Object.values(termObj).includes(elementName)) {
            while (Object.values(termObj).includes(elementName + "-" + count.toString(10))) {
                count++;
            }
            elementName += "-" + count.toString(10);
        }
        termObj[id] = elementName;
    }

    for (let id of Object.keys(termObj)) {
        let subject = namedNode(termObj[id]);
        //type
        writer.addQuad(subject, namedNode(parsePrefix("rdf", "type")), namedNode(parsePrefix("skos", "Concept")));
        //prefLabel
        if (!(ProjectElements[id].untitled)) {
            for (let lang of Object.keys(VocabularyElements[ProjectElements[id].iri].labels)) {
                if (VocabularyElements[ProjectElements[id].iri].labels[lang].length > 0) {
                    writer.addQuad(subject, namedNode(parsePrefix("skos", "prefLabel")), literal(VocabularyElements[ProjectElements[id].iri].labels[lang], lang));
                }
            }
        }
        //rdfs:isDefinedBy
        writer.addQuad(subject, namedNode(parsePrefix("skos", "inScheme")), namedNode(VocabularyElements[ProjectElements[id].iri].inScheme));
    }
    return writer.end((error: any, result: any) => {
        callback(result);
    })
}