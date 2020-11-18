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
import {updateDeleteProjectElement} from "../interface/TransactionInterface";
import {LinkType} from "../config/Enum";

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
        graph: ProjectSettings.ontographerContext,
        color: "#FFF"
    }

    for (let type in LinkConfig) {
        let intType = parseInt(type, 10);
        if (intType !== LinkType.DEFAULT) {
            Links[scheme + "/" + LinkConfig[type].labels["en"]] = {
                subClassOfDomain: [], subClassOfRange: [], typesDomain: [], typesRange: [],
                labels: LinkConfig[type].labels,
                definitions: initLanguageObject(""),
                inScheme: scheme,
                type: intType,
                domain: "",
                range: ""
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

export function addRelationships(): string[] {
    let linksToPush: string[] = [];
    for (let iri in VocabularyElements) {
        let id = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === iri);
        let domain = VocabularyElements[iri].domain;
        let range = VocabularyElements[iri].range;
        if (id && ((domain && VocabularyElements[domain]) || (range && VocabularyElements[range]))) {
            let domainID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === domain);
            let rangeID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === range);
            let link = ProjectElements[id].connections.find(conn =>
                ProjectElements[ProjectLinks[conn].target].iri === domain);
            if (domainID && (!link)) {
                let linkDomain = getNewLink();
                if (typeof linkDomain.id === "string") {
                    addLink(linkDomain.id, parsePrefix("z-sgov-pojem", "má-vztažený-prvek-1"), id, domainID);
                    ProjectElements[id].connections.push(linkDomain.id);
                    linksToPush.push(linkDomain.id);
                }
            }
            link = ProjectElements[id].connections.find(conn =>
                ProjectElements[ProjectLinks[conn].target].iri === range);
            if (rangeID && (!link)) {
                let linkRange = getNewLink();
                if (typeof linkRange.id === "string") {
                    addLink(linkRange.id, parsePrefix("z-sgov-pojem", "má-vztažený-prvek-2"), id, rangeID);
                    ProjectElements[id].connections.push(linkRange.id);
                    linksToPush.push(linkRange.id);
                }
            }
        }

        for (let subClassOf of VocabularyElements[iri].subClassOf) {
            if (Object.keys(VocabularyElements).find(element => element === subClassOf)) {
                let domainID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === iri);
                let rangeID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === subClassOf);
                if (domainID && rangeID && !(ProjectElements[domainID].connections.find(conn =>
                    ProjectElements[ProjectLinks[conn].target].iri === subClassOf))) {
                    let linkGeneralization = getNewLink(LinkType.GENERALIZATION);
                    if (typeof linkGeneralization.id === "string") {
                        addLink(linkGeneralization.id, ProjectSettings.ontographerContext + "/uml/generalization", domainID, rangeID, LinkType.GENERALIZATION);
                        ProjectElements[domainID].connections.push(linkGeneralization.id);
                        linksToPush.push(linkGeneralization.id);
                    }
                }
            }
        }
    }
    return linksToPush;
}

export async function deletePackageItem(id: string): Promise<boolean> {
    let folder = ProjectElements[id].package;
    let iri = ProjectElements[id].iri;
    folder.elements.splice(folder.elements.indexOf(id), 1);
    for (let connection of ProjectElements[id].connections) {
        ProjectLinks[connection].active = false;
        updateDeleteProjectElement(ProjectSettings.contextEndpoint,
            ProjectSettings.ontographerContext + "-" + connection,
            ProjectSettings.ontographerContext);
    }
    let targets = Object.keys(ProjectLinks).filter(link => ProjectElements[ProjectLinks[link].target].iri === iri)
    for (let connection of targets) {
        ProjectLinks[connection].active = false;
        updateDeleteProjectElement(ProjectSettings.contextEndpoint,
            ProjectSettings.ontographerContext + "-" + connection,
            ProjectSettings.ontographerContext)
    }
    targets.forEach(target => {
        let elem = Object.keys(ProjectElements).find(elem => ProjectElements[elem].connections.includes(target));
        if (elem) ProjectElements[elem].connections.splice(ProjectElements[elem].connections.indexOf(target), 1);
    })
    ProjectElements[id].connections = [];
    if (graph.getCell(id)) {
        graph.removeCells([graph.getCell(id)]);
    }
    ProjectElements[id].active = false;
    return true;
}

export function setElementShape(elem: joint.dia.Element, width: number, height: number) {
    let types = VocabularyElements[ProjectElements[elem.id].iri].types;
    elem.prop('attrs/bodyBox/width', width);
    elem.prop('attrs/bodyBox/height', height);
    elem.prop('attrs/bodyBox/visibility', 'hidden');
    elem.prop('attrs/bodyBox/display', 'none');
    elem.prop('attrs/bodyEllipse/display', 'none');
    elem.prop('attrs/bodyTrapezoid/display', 'none');
    elem.prop('attrs/bodyDiamond/display', 'none');
    elem.prop('attrs/bodyBox/strokeDasharray', 'none');
    elem.prop('attrs/label/color', 'black');
    elem.prop('attrs/bodyBox/stroke', 'black');
    if (types.includes(parsePrefix("z-sgov-pojem", "typ-objektu"))) {
        elem.prop('attrs/bodyBox/display', 'block');
        elem.prop('attrs/bodyBox/visibility', 'visible');
        elem.prop('attrs/bodyBox/fill',
            Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color);
    } else if (types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))) {
        elem.prop('attrs/bodyEllipse/display', 'block');
        elem.prop('attrs/bodyEllipse/visibility', 'visible');
        elem.prop('attrs/bodyEllipse/rx', width * (2 / 3));
        elem.prop('attrs/bodyEllipse/ry', height * (2 / 3));
        elem.prop('attrs/bodyEllipse/cx', width / 2);
        elem.prop('attrs/bodyEllipse/cy', height / 2);
        elem.prop('attrs/bodyEllipse/stroke', 'black');
        elem.prop('attrs/bodyEllipse/fill',
            Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color);
    } else if (types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))) {
        elem.prop('attrs/bodyDiamond/display', 'block');
        elem.prop('attrs/bodyDiamond/visibility', 'visible');
        elem.prop('attrs/bodyDiamond/points', `${width / 2},${-(height / 2)} ${width * (9 / 8)},${height / 2} ${width / 2},${height * (3 / 2)} ${-(width / 8)},${height / 2}`);
        elem.prop('attrs/bodyDiamond/stroke', 'black');
        elem.prop('attrs/bodyDiamond/fill',
            Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color);
    } else if (types.includes(parsePrefix("z-sgov-pojem", "typ-události"))) {
        elem.prop('attrs/bodyTrapezoid/display', 'block');
        elem.prop('attrs/bodyTrapezoid/visibility', 'visible');
        elem.prop('attrs/bodyTrapezoid/points', `0,0 ${width},0 ${width + 20},${height} -20,${height}`);
        elem.prop('attrs/bodyTrapezoid/stroke', 'black');
        elem.prop('attrs/bodyTrapezoid/fill',
            Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color);
    } else {
        elem.prop('attrs/bodyBox/display', 'block');
        elem.prop('attrs/bodyBox/visibility', 'visible');
        elem.prop('attrs/bodyBox/strokeDasharray', '10,10');
        elem.prop('attrs/label/color', 'grey');
        elem.prop('attrs/bodyBox/stroke', 'grey');
        elem.prop('attrs/bodyBox/fill',
            Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color);
    }
}