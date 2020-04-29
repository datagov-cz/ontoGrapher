import {
    graph,
    Languages,
    Links,
    ModelElements,
    Namespaces,
    Prefixes,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    Stereotypes,
    ViewSettings,
    VocabularyElements
} from "../config/Variables";
import * as Locale from "../locale/LocaleMain.json";

export function getNameOfStereotype(uri: string): string {
    let stereotype = Stereotypes[uri];
    return Namespaces[stereotype.prefix] + stereotype.name;
}

export function getNameOfLink(uri: string): string {
    let stereotype = Links[uri];
    return Namespaces[stereotype.prefix] + stereotype.name;
}

export function getName(element: string, language: string): string {
    if (ViewSettings.display === 1) {
        return getNameOfStereotype(element);
    } else {
        if (element in Stereotypes) {
            return Stereotypes[element].labels[language];
        } else {
            return VocabularyElements[element].labels[language];
        }
    }
}

export function getStereotypeList(iris: string[], language: string): string[] {
    return iris.map(iri => {
        if (iri in Stereotypes) {
            return Stereotypes[iri].labels[language];
        } else {
            return VocabularyElements[iri].labels[language];
        }
    });
}


export function getModelName(element: string, language: string) {
    if (ViewSettings.display === 1) {
        return getNameOfStereotype(element);
    } else {
        return ModelElements[element].labels[language];
    }
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
    ProjectSettings.status = "";
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
    for (let iri in ModelElements) {
        if (ModelElements[iri].domain && ModelElements[ModelElements[iri].domain]) {
            if (!(ModelElements[ModelElements[iri].domain].domainOf.includes(iri))) {
                ModelElements[ModelElements[iri].domain].domainOf.push(iri);
            }
        } else if (ModelElements[iri].domain && VocabularyElements[ModelElements[iri].domain]) {
            if (!(VocabularyElements[ModelElements[iri].domain].domainOf.includes(iri))) {
                VocabularyElements[ModelElements[iri].domain].domainOf.push(iri);
            }
        }
    }

    for (let iri in VocabularyElements) {
        if (VocabularyElements[iri].domain && VocabularyElements[VocabularyElements[iri].domain]) {
            if (!(VocabularyElements[VocabularyElements[iri].domain].domainOf.includes(iri))) {
                VocabularyElements[VocabularyElements[iri].domain].domainOf.push(iri);
            }
        } else if (VocabularyElements[iri].domain && ModelElements[VocabularyElements[iri].domain]) {
            if (!(ModelElements[VocabularyElements[iri].domain].domainOf.includes(iri))) {
                ModelElements[VocabularyElements[iri].domain].domainOf.push(iri);
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

