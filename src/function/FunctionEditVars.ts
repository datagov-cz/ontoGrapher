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
import {graph} from "../graph/Graph";
import {addLink} from "./FunctionCreateVars";
import {LinkConfig} from "../config/LinkConfig";
import {updateDeleteTriples} from "../interface/TransactionInterface";
import {LinkType} from "../config/Enum";
import {Locale} from "../config/Locale";
import {getNewLink} from "./FunctionGetVars";
import {Cardinality} from "../datatypes/Cardinality";

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
                range: "",
                inverseOf: "",
                defaultSourceCardinality: new Cardinality("", ""),
                defaultTargetCardinality: new Cardinality("", "")
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
    ProjectSettings.name = initLanguageObject(Locale[ProjectSettings.viewLanguage].untitledProject);
    ProjectSettings.description = initLanguageObject("");
    ProjectSettings.selectedDiagram = 0;
}

export function initLanguageObject(def: any) {
    let result: { [key: string]: any } = {};
    for (let code in Languages) {
        result[code] = def;
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

export function deletePackageItem(id: string): { add: string[], delete: string[], update: string[] } {
    let folder = ProjectElements[id].package;
    let iri = ProjectElements[id].iri;
    let triples: string[] = [];
    folder.elements.splice(folder.elements.indexOf(id), 1);
    for (let connection of ProjectElements[id].connections) {
        ProjectLinks[connection].active = false;
        triples = triples.concat(updateDeleteTriples(ProjectSettings.ontographerContext + "-" + connection,
            ProjectSettings.ontographerContext, false, false));
    }
    let targets = Object.keys(ProjectLinks).filter(link => ProjectElements[ProjectLinks[link].target].iri === iri)
    for (let connection of targets) {
        ProjectLinks[connection].active = false;
        triples = triples.concat(updateDeleteTriples(ProjectSettings.ontographerContext + "-" + connection,
            ProjectSettings.ontographerContext, false, false));
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
    return {add: [], delete: [], update: triples};
}

export function setElementShape(elem: joint.dia.Element, width: number, height: number) {
    let types = VocabularyElements[ProjectElements[elem.id].iri].types;
    elem.attr({
        bodyBox: {display: 'none'},
        bodyEllipse: {display: 'none'},
        bodyTrapezoid: {display: 'none'},
        bodyDiamond: {display: 'none'},
        label: {color: 'black'}
    });
    if (types.includes(parsePrefix("z-sgov-pojem", "typ-objektu"))) {
        elem.attr({
            bodyBox: {
                display: 'block',
                width: width,
                height: height,
                strokeDasharray: 'none',
                stroke: 'black',
                fill: Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color
            }
        });
    } else if (types.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))) {
        elem.attr({
            bodyEllipse: {
                display: 'block',
                rx: width * (3 / 5),
                ry: height * (2 / 3),
                cx: width / 2,
                cy: height / 2,
                stroke: 'black',
                fill: Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color
            }
        });
    } else if (types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))) {
        elem.attr({
            bodyDiamond: {
                display: 'block',
                points: `${width / 2},${-(height / 2)} ${width * (9 / 8)},${height / 2} ${width / 2},${height * (3 / 2)} ${-(width / 8)},${height / 2}`,
                stroke: 'black',
                fill: Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color
            }
        });
    } else if (types.includes(parsePrefix("z-sgov-pojem", "typ-události"))) {
        elem.attr({
            bodyTrapezoid: {
                display: 'block',
                points: `20,0 ${width - 20},0 ${width},${height} 0,${height}`,
                stroke: 'black',
                fill: Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color
            }
        });
    } else {
        elem.attr({
            bodyBox: {
                display: 'block',
                width: width,
                height: height,
                strokeDasharray: '10,10',
                stroke: 'grey',
                fill: Schemes[VocabularyElements[ProjectElements[elem.id].iri].inScheme].color
            },
            label: {color: 'grey'}
        });
    }
}