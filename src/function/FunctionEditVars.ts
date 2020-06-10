import {
    Languages,
    Links,
    PackageRoot,
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
import {graphElement} from "../graph/GraphElement";
import {addClass, addLink} from "./FunctionCreateVars";
import {updateProjectLink} from "../interface/TransactionInterface";
import {LinkConfig} from "../config/LinkConfig";
import {getNewLink} from "./FunctionGraph";

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

export function addDomainOfIRIs() {
    for (let iri in VocabularyElements) {
        let domain = VocabularyElements[iri].domain;
        if (domain && VocabularyElements[domain]) {
            for (let id in ProjectElements) {
                let flag = true;
                let range = undefined;
                if (ProjectElements[id].iri === domain) {
                    for (let conn of ProjectElements[id].connections) {
                        if (ProjectLinks[conn].iri === iri) {
                            flag = false;
                            break;
                        }
                    }
                    for (let targetID in ProjectElements) {
                        if (ProjectElements[targetID].iri === VocabularyElements[iri].range) {
                            range = targetID;
                        }
                    }
                    if (flag && range) {
                        let linkDomain = getNewLink();
                        let linkRange = getNewLink();
                        let relationship = new graphElement();
                        if (typeof relationship.id === "string" && typeof linkDomain.id === "string" && typeof linkRange.id === "string") {
                            addClass(relationship.id, iri,
                                PackageRoot.children.find(pkg => pkg.scheme === VocabularyElements[iri].inScheme) || ProjectSettings.selectedPackage, false);
                            addLink(linkDomain.id, parsePrefix("z-sgov-pojem", "má-vztažený-prvek-1"), relationship.id, id, "default");
                            addLink(linkRange.id, parsePrefix("z-sgov-pojem", "má-vztažený-prvek-2"), relationship.id, range, "default");
                            updateProjectLink(ProjectSettings.contextEndpoint, linkDomain.id, "FunctionEditVars");
                            updateProjectLink(ProjectSettings.contextEndpoint, linkRange.id, "FunctionEditVars");
                        }
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

