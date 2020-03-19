import {
    CardinalityPool,
    Diagrams,
    graph,
    Links,
    ModelElements,
    Namespaces,
    PackageRoot,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    PropertyPool,
    StereotypeCategories,
    Stereotypes,
    ViewSettings
} from "../var/Variables";
import {SourceData} from "../components/SourceData";
import * as VariableLoader from "./../var/VariableLoader";
import * as LocaleMain from "../locale/LocaleMain.json";
import {PackageNode} from "../components/PackageNode";
import {graphElement} from "../graph/GraphElement";
import * as joint from 'jointjs';
import {AttributeObject} from "../components/AttributeObject";
import {AttributeType} from "../components/AttributeType";

export function getNameOfStereotype(uri: string): string {
    let stereotype = Stereotypes[uri];
    return Namespaces[stereotype.prefix] + stereotype.name;
}

export function getNameOfLink(uri: string): string {
    let stereotype = Links[uri];
    return Namespaces[stereotype.prefix] + stereotype.name;
}

export function getName(element: string, language: string): string {
    if (ViewSettings.display == 1) {
        return getNameOfStereotype(element);
    } else {
        return Stereotypes[element].labels[language];
    }
}


export function getModelName(element: string, language: string) {
    if (ViewSettings.display == 1) {
        return getNameOfStereotype(element);
    } else {
        return ModelElements[element].labels[language];
    }
}

export function addSTP(data: SourceData) {
    if (!(StereotypeCategories.includes(data.source))) {
        StereotypeCategories.push(data.source);
    }
    Stereotypes[data.iri] = {
        labels: VariableLoader.initLanguageObject(data.name),
        descriptions: VariableLoader.initLanguageObject(data.description),
        category: data.source
    }
}

export function addModelTP(data: SourceData) {
    ModelElements[data.iri] = {
        labels: VariableLoader.initLanguageObject(data.name),
        descriptions: VariableLoader.initLanguageObject(data.description),
        category: data.source
    }
}

export function addClass(id: string, iri: string, language: string) {
    let result: { [key: string]: any } = {};
    result["iri"] = iri;
    result["names"] = VariableLoader.initLanguageObject(LocaleMain.untitled + " " + getName(iri, language));
    result["connections"] = [];
    result["descriptions"] = VariableLoader.initLanguageObject("");
    result["attributes"] = [];
    let propertyArray: AttributeObject[] = [];
    PropertyPool[Stereotypes[iri].category].forEach((attr: AttributeType)=>propertyArray.push(new AttributeObject("",attr)));
    result["properties"] = propertyArray;
    let diagramArray: boolean[] = [];
    Diagrams.forEach((obj, i) => {
        diagramArray.push(false);
    });
    result["diagrams"] = [ProjectSettings.selectedDiagram];
    result["hidden"] = diagramArray;
    result["package"] = PackageRoot;
    result["active"] = true;
    PackageRoot.elements.push(id);
    ProjectElements[id] = result;
}

export function addmodel(id: string, iri: string, language: string, name: string) {
    let result: { [key: string]: any } = {};
    result["iri"] = iri;
    result["names"] = VariableLoader.initLanguageObject(LocaleMain.untitled + " " + name);
    result["connections"] = [];
    result["descriptions"] = VariableLoader.initLanguageObject("");
    result["attributes"] = [];
    let diagramArray: boolean[] = [];
    Diagrams.forEach((obj, i) => {
        diagramArray.push(false);
    });
    result["diagrams"] = [ProjectSettings.selectedDiagram];
    result["hidden"] = diagramArray;
    result["package"] = PackageRoot;
    result["active"] = false;
    ProjectElements[id] = result;
}

export function addLink(id: string, iri: string, source: string, target: string) {
    let result: { [key: string]: any } = {};
    result["iri"] = iri;
    result["sourceCardinality"] = CardinalityPool[0];
    result["targetCardinality"] = CardinalityPool[0];
    result["source"] = source;
    result["target"] = target;
    result["diagram"] = Diagrams[ProjectSettings.selectedDiagram].name;
    ProjectLinks[id] = result;
}

//TODO
export function testing() {
    let node = new PackageNode("test", undefined);
    node.parent = PackageRoot;
    PackageRoot.children.push(node);
}

export function deletePackageItem(id: string) {
    let folder = ProjectElements[id].package;
    folder.elements.splice(folder.elements.indexOf(id), 1);
    if (graph.getCell(id)){
        graph.removeCells([graph.getCell(id)]);
    }
    ProjectElements[id].active = false;
}

export function changeDiagrams(diagram: any) {
    ProjectSettings.selectedDiagram = diagram;
    graph.fromJSON(Diagrams[diagram].json);
}

export function saveDiagram() {
    let cells = graph.getCells();
    let elements = [];
    let links = [];
    for (let cell of cells) {
        if (cell.id in ProjectElements) {
            elements.push({
                id: cell.id,
                pos: cell.get('position'),
                label: cell.attr('label/text')
            });
        }
    }

    for (let link of graph.getLinks()) {
        links.push({
            id: link.id,
            source: link.getSourceCell()?.id,
            target: link.getTargetCell()?.id,
            vertices: link.vertices(),
            labels: link.labels()
        });
    }
    return {elements: elements, links: links}
}

export function loadDiagram(load: {
    elements: {
        id: any;
        label: any;
        pos: any;
    }[], links: {
        vertices: { (): joint.dia.Link.Vertex[]; (vertices: joint.dia.Link.Vertex[]): joint.shapes.standard.Link };
        labels: any;
        target: string;
        source: string;
    }[]
}) {
    graph.clear();
    for (let elem of load.elements) {
        // @ts-ignore
        let cls = graphElement.create(elem.id).prop({
            size: {width: 180, height: 50},
            position: elem.pos,
            attrs: {label: {text: elem.label}}
        });
        cls.addTo(graph);
    }
    for (let link of load.links) {
        let lnk = new joint.shapes.standard.Link();
        lnk.source({id: link.source});
        lnk.target({id: link.target});
        lnk.labels(link.labels);
        // @ts-ignore
        lnk.vertices(link.vertices);
        lnk.addTo(graph);
    }
}