import {
    Languages,
    Links,
    Prefixes,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Schemes,
    Stereotypes,
    VocabularyElements
} from "../config/Variables";
import * as Locale from "../locale/LocaleMain.json";
import {graph} from "../graph/Graph";
import {addLink} from "./FunctionCreateVars";
import {LinkConfig} from "../config/LinkConfig";
import {getNewLink} from "./FunctionGraph";
import {updateProjectLink} from "../interface/TransactionInterface";

export function getName(element: string, language: string): string {
    if (element in Stereotypes) {
        return Stereotypes[element].labels[language];
    } else {
        return VocabularyElements[element].labels[language];
    }
}

export function getStereotypeList(iris: string[], language: string): string[] {
    let result: string[] = [];
    iris.forEach(iri => {
        if (iri in Stereotypes) {
            result.push(Stereotypes[iri].labels[language]);
        }
    });
    return result;
}


export function initVars() {
    loadLanguages();
    initProjectSettings();
    loadUML();
}

export function loadUML() {
    let scheme = ProjectSettings.ontographerContext + "/uml";

    Schemes[scheme] = {
        labels: initLanguageObject("UML"),
        readOnly: false,
        graph: ProjectSettings.ontographerContext
    }

    for (let type in LinkConfig) {
        if (type !== "default") {
            Links[scheme + "/" + type] = {
                labels: LinkConfig[type].labels,
                definitions: initLanguageObject(""),
                inScheme: scheme,
                type: type
            }
        }
    }
}

export function loadLanguages() {
    const json = require('../config/Languages.json');
    for (let code in json) {
        if (json.hasOwnProperty(code)) Languages[code] = json[code];
    }
}

export function initProjectSettings() {
    ProjectSettings.name = initLanguageObject(Locale.untitledProject);
    ProjectSettings.description = initLanguageObject("");
    ProjectSettings.selectedDiagram = 0;
}

export function initLanguageObject(defaultString: string) {
    let result: { [key: string]: string } = {};
    for (let code in Languages) {
        result[code] = defaultString;
    }
    return result;
}

export function parsePrefix(prefix: string, name: string): string {
    return Prefixes[prefix] + name;
}

export function addRelationships() {
    for (let iri in VocabularyElements) {
        let id = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === iri);
        let domain = VocabularyElements[iri].domain;
        let range = VocabularyElements[iri].range;
        if (id && ((domain && VocabularyElements[domain]) || (range && VocabularyElements[range]))) {
            let domainID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === domain);
            let rangeID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === range);
            if (domainID && !(ProjectElements[id].connections.find(conn => ProjectElements[ProjectLinks[conn].target].iri === domain))) {
                let linkDomain = getNewLink();
                if (typeof linkDomain.id === "string") {
                    addLink(linkDomain.id, parsePrefix("z-sgov-pojem", "má-vztažený-prvek-1"), id, domainID);
                    ProjectElements[id].connections.push(linkDomain.id);
                    updateProjectLink(ProjectSettings.contextEndpoint, linkDomain.id, "FunctionEditVars");
                }
            }
            if (rangeID && !(ProjectElements[id].connections.find(conn => ProjectElements[ProjectLinks[conn].target].iri === range))) {
                let linkRange = getNewLink();
                if (typeof linkRange.id === "string") {
                    addLink(linkRange.id, parsePrefix("z-sgov-pojem", "má-vztažený-prvek-2"), id, rangeID);
                    ProjectElements[id].connections.push(linkRange.id);
                    updateProjectLink(ProjectSettings.contextEndpoint, linkRange.id, "FunctionEditVars");
                }
            }
        }

        for (let subClassOf of VocabularyElements[iri].subClassOf) {
            if (Object.keys(VocabularyElements).find(element => element === subClassOf)) {
                let domainID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === iri);
                let rangeID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === subClassOf);
                if (domainID && rangeID && !(ProjectElements[domainID].connections.find(conn => ProjectElements[ProjectLinks[conn].target].iri === subClassOf))) {
                    let linkGeneralization = getNewLink("generalization");
                    if (typeof linkGeneralization.id === "string") {
                        addLink(linkGeneralization.id, ProjectSettings.ontographerContext + "/uml/generalization", domainID, rangeID, "generalization");
                        ProjectElements[domainID].connections.push(linkGeneralization.id);
                        updateProjectLink(ProjectSettings.contextEndpoint, linkGeneralization.id, "FunctionEditVars");
                    }
                }
            }
        }
    }
}

export function deletePackageItem(id: string) {
    let folder = ProjectElements[id].package;
    folder.elements.splice(folder.elements.indexOf(id), 1);
    for (let connection in ProjectElements[id].connections) {
        delete ProjectLinks[ProjectElements[id].connections[connection]];
    }
    ProjectElements[id].connections.splice(0, ProjectElements[id].connections.length - 1);
    if (graph.getCell(id)) {
        graph.removeCells([graph.getCell(id)]);
    }
    ProjectElements[id].active = false;

}

