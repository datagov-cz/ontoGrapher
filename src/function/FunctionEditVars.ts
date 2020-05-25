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
import {addLink} from "./FunctionCreateVars";
import * as joint from "jointjs";
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
                        let link = new joint.dia.Link();
                        if (typeof link.id === "string") {
                            addLink(link.id, iri, id, range);
                            updateProjectLink(ProjectSettings.contextEndpoint, link.id, "FunctionEditVars");
                        }
                    }
                }
            }
        }
    }
    console.log(ProjectLinks);
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

