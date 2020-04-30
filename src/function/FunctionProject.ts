import {
    AttributeTypePool,
    CardinalityPool,
    Diagrams,
    Languages,
    Links,
    PackageRoot,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    PropertyPool,
    Stereotypes,
    VocabularyElements
} from "../config/Variables";
import {loadDiagram, saveDiagram} from "./FunctionDiagram";
import {PackageNode} from "../datatypes/PackageNode";
import {graph} from "../graph/graph";
import {initProjectSettings} from "./FunctionEditVars";
import * as Locale from "../locale/LocaleMain.json";

export function saveProject(): { [key: string]: any } {
    Diagrams[ProjectSettings.selectedDiagram].json = saveDiagram();
    let save = {
        projectElements: ProjectElements,
        projectLinks: ProjectLinks,
        projectSettings: ProjectSettings,
        diagrams: Diagrams,
        packageRoot: savePackages(),
        //loaded things
        stereotypes: Stereotypes,
        vocabularyElements: VocabularyElements,
        links: Links,
        languages: Languages,
        properties: PropertyPool,
        attributes: AttributeTypePool,
        cardinalities: CardinalityPool
    };
    //keep this .log
    console.log(save);
    return save;
}

export function savePackages() {
    let result = [];
    let q = [];
    q.push(PackageRoot);
    q.push(undefined);
    while (q.length > 0) {
        let p: PackageNode | undefined = q.shift();
        if (p === undefined) {
            q.push(undefined);
            if (q[0] === undefined) break;
            else continue;
        }
        let trace: number[] = [];
        let iter: PackageNode = p;
        while (iter !== PackageRoot) {
            let parent = iter.parent;
            if (parent) {
                trace.unshift(parent.children.indexOf(iter));
                iter = parent;
            } else break;
        }
        trace.shift();
        result.push({
            trace: trace,
            elements: p.elements,
            root: p === PackageRoot,
            scheme: p.scheme
        });

        for (let sp of p.children) {
            q.push(sp);
        }
    }
    return result;
}


export function loadPackages(list: { trace: number[], elements: string[], root: boolean, scheme: string }[]) {
    for (let pkg of list) {
        if (pkg.root) {
            PackageRoot.elements = pkg.elements;
        } else {
            let iter = PackageRoot;
            for (let i = 0; i < pkg.trace.length; i++) {
                iter = iter.children[pkg.trace[i]];
            }
            let newpkg = new PackageNode(iter, false);
            newpkg.scheme = pkg.scheme;
            newpkg.elements = pkg.elements;
            iter.children.push(newpkg);
        }
    }
}

export function newProject() {
    graph.clear();
    initProjectSettings();
    Diagrams.length = 0;
    Diagrams.push({name: Locale.untitled, json: ""});
    Object.keys(VocabularyElements).forEach(el => delete VocabularyElements[el]);
    Object.keys(ProjectElements).forEach(el => delete ProjectElements[el]);
    Object.keys(ProjectLinks).forEach(el => delete ProjectLinks[el]);
    PackageRoot.elements = [];
    PackageRoot.children = [];
}

export function loadProject(loadString: string) {
    let save = JSON.parse(loadString);
    for (let key in save.projectElements) {
        ProjectElements[key] = save.projectElements[key];
    }
    for (let key in save.projectLinks) {
        ProjectLinks[key] = save.projectLinks[key];
    }
    for (let key in save.vocabularyElements) {
        VocabularyElements[key] = save.vocabularyElements[key];
    }
    Diagrams.length = 0;
    save.diagrams.forEach((diagram: { name: string, json: any }) => {
        Diagrams.push(diagram)
    });
    ProjectSettings.name = save.projectSettings.name;
    ProjectSettings.description = save.projectSettings.description;
    ProjectSettings.selectedDiagram = 0;
    loadDiagram(Diagrams[ProjectSettings.selectedDiagram].json);
    loadPackages(save.packageRoot);
}