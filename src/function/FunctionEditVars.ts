import {
    Languages,
    Prefixes,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Stereotypes,
    VocabularyElements
} from "../config/Variables";
import * as Locale from "../locale/LocaleMain.json";
import {graph} from "../graph/graph";

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
        } else if (iri in VocabularyElements) {
            result.push(VocabularyElements[iri].labels[language]);
        }
    });
    return result;
}


export function initVars() {
    loadLanguages();
    initProjectSettings();
}

export function loadLanguages() {
    const json = require('../config/Languages.json');
    for (let code in json) {
        Languages[code] = json[code];
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

export function parsePrefix(prefix: string, name: string) {
    return Prefixes[prefix] + name;
}

export function addDomainOfIRIs() {
    for (let iri in VocabularyElements) {
        let domain = VocabularyElements[iri].domain;
        if (domain && VocabularyElements[domain]) {
            if (!(VocabularyElements[domain].domainOf.includes(iri))) {
                VocabularyElements[domain].domainOf.push(iri);
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

