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
import {graph} from "../graph/Graph";
import {addClass} from "./FunctionCreateVars";
import {LinkConfig} from "../config/LinkConfig";
import {LinkType} from "../config/Enum";
import {Locale} from "../config/Locale";
import {updateDeleteTriples} from "../queries/UpdateMiscQueries";
import {Cardinality} from "../datatypes/Cardinality";
import {graphElement} from "../graph/GraphElement";
import {getElemFromIRI} from "./FunctionGetVars";

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
    const scheme = ProjectSettings.ontographerContext + "/uml";

    Schemes[scheme] = {
        labels: initLanguageObject("UML"),
        readOnly: false,
        graph: ProjectSettings.ontographerContext,
        color: "#FFF"
    }

    for (const type in LinkConfig) {
        const intType = parseInt(type, 10);
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
    for (const code in json) {
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
    for (const code in Languages) {
        result[code] = def;
    }
    return result;
}

export function parsePrefix(prefix: string, name: string): string {
    return Prefixes[prefix] + name;
}

export function deletePackageItem(id: string): string[] {
    const folder = ProjectElements[id].package;
    const iri = ProjectElements[id].iri;
    let queries: string[] = [];
    folder.elements.splice(folder.elements.indexOf(id), 1);
    for (const connection of ProjectElements[id].connections) {
        ProjectLinks[connection].active = false;
        queries.push(updateDeleteTriples(ProjectSettings.ontographerContext + "-" + connection,
            ProjectSettings.ontographerContext, true, false, false));
    }
    const targets = Object.keys(ProjectLinks).filter(link => ProjectElements[ProjectLinks[link].target].iri === iri)
    for (const connection of targets) {
        ProjectLinks[connection].active = false;
        queries.push(updateDeleteTriples(ProjectSettings.ontographerContext + "-" + connection,
            ProjectSettings.ontographerContext, true, false, false));
    }
    targets.forEach(target => {
        const elem = Object.keys(ProjectElements).find(elem => ProjectElements[elem].connections.includes(target));
        if (elem) ProjectElements[elem].connections.splice(ProjectElements[elem].connections.indexOf(target), 1);
    })
    VocabularyElements[ProjectElements[id].iri].labels = initLanguageObject("");
    ProjectElements[id].connections = [];
    if (graph.getCell(id)) {
        graph.removeCells([graph.getCell(id)]);
    }
    ProjectElements[id].active = false;
    return queries;
}

export function setElementShape(elem: joint.dia.Element, width: number, height: number) {
    const types = VocabularyElements[ProjectElements[elem.id].iri].types;
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

export function initElements() {
    let ids: string[] = [];
    for (const iri in VocabularyElements) {
        if (!(getElemFromIRI(iri))) {
            let pkg = PackageRoot.children.find(pkg => pkg.scheme === VocabularyElements[iri].inScheme);
            const id = new graphElement().id as string;
            if (pkg) {
                addClass(id, iri, pkg);
                ids.push(id);
            }
        }
    }
    return ids;
}