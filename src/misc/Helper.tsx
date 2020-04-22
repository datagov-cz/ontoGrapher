import {
    CardinalityPool,
    Diagrams,
    graph,
    Links,
    ModelElements,
    Namespaces,
    PackageRoot, Prefixes,
    ProjectElements,
    ProjectLinks,
    ProjectSettings,
    PropertyPool, Schemes,
    StereotypeCategories,
    Stereotypes, structuresShort,
    ViewSettings, VocabularyElements
} from "../var/Variables";
import {SourceData} from "../components/SourceData";
import * as VariableLoader from "./../var/VariableLoader";
import * as LocaleMain from "../locale/LocaleMain.json";
import {graphElement} from "../graph/GraphElement";
import * as joint from 'jointjs';
import {AttributeObject} from "../components/AttributeObject";
import {AttributeType} from "../components/AttributeType";
import {DataFactory} from "n3";
import {PackageNode} from "../components/PackageNode";
import {initLanguageObject} from "./../var/VariableLoader";

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
        if (element in Stereotypes){
            return Stereotypes[element].labels[language];
        } else {
            return VocabularyElements[element].labels[language];
        }
    }
}

export function getStereotypeList(iris: string[], language: string) : string[]{
    return iris.map(iri => {
        if (iri in Stereotypes){
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

export function addSTP(data: SourceData) {
    if (!(StereotypeCategories.includes(data.source))) {
        StereotypeCategories.push(data.source);
    }
    Stereotypes[data.iri] = {
        labels: VariableLoader.initLanguageObject(data.name),
        definitions: VariableLoader.initLanguageObject(data.description),
        category: data.source,
        skos: {}
    }
}

export function addModelTP(data: SourceData) {
    ModelElements[data.iri] = {
        labels: VariableLoader.initLanguageObject(data.name),
        definitions: VariableLoader.initLanguageObject(data.description),
        category: data.source,
        skos: {}
    }
}

export function parsePrefix(prefix: string, name: string){
    return Prefixes[prefix] + name;
}

export function createNewScheme() : string{
    let result = "https://slovník.gov.cz/" + structuresShort[ProjectSettings.knowledgeStructure] + "/" + LocaleMain.untitled;
    if (result in Schemes){
        let count = 1;
        while((result + "-" + count.toString(10)) in Schemes){
            count++;
        }
        result += "-" + count.toString(10);
    }
    result = result.trim().replace(/\s/g, '-');
    Schemes[result] = {labels: initLanguageObject("")}
    return result;
}

export function addClass(
    id: string,
    iris: string[],
    language: string,
    scheme: string,
    pkg: PackageNode = PackageRoot,
    untitled: boolean = true,
    stereotype: boolean = true,
    names?: {}, descriptions?: {}) {
    let result: { [key: string]: any } = {};
    result["iri"] = iris;
    result["names"] = names ? names : VariableLoader.initLanguageObject(LocaleMain.untitled + " " + getName(iris[0], language));
    result["connections"] = [];
    result["untitled"] = untitled;
    result["descriptions"] = descriptions ? descriptions : VariableLoader.initLanguageObject("");
    result["attributes"] = [];
    let propertyArray: AttributeObject[] = [];
    if (stereotype){
        for (let iri of iris){
            if (Stereotypes[iri].category in PropertyPool){
                PropertyPool[Stereotypes[iri].category].forEach((attr: AttributeType)=>{
                    let newAttr = new AttributeObject("",attr);
                    if (!(propertyArray.includes(newAttr))) propertyArray.push(newAttr);
                });
            }
        }
    }
    result["properties"] = propertyArray;
    let diagramArray: boolean[] = [];
    Diagrams.forEach((obj, i) => {
        diagramArray.push(false);
    });
    result["diagrams"] = [ProjectSettings.selectedDiagram];
    result["hidden"] = diagramArray;
    result["package"] = pkg;
    result["active"] = true;
    result["scheme"] = scheme;
    pkg.elements.push(id);
    ProjectElements[id] = result;
}

export function addModel(id: string, iri: string, language: string, name: string) {
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

export function createLanguageObject(init: string, lang: string){
    let result: {[key:string]: any} = {};
    result[lang] = init;
    return result;
}

export function testing() {
    // let node = new PackageNode("test", undefined);
    // node.parent = PackageRoot;
    // PackageRoot.children.push(node);
}

export function deletePackageItem(id: string) {
    let folder = ProjectElements[id].package;
    folder.elements.splice(folder.elements.indexOf(id), 1);
    for (let connection in ProjectElements[id].connections){
        delete ProjectLinks[ProjectElements[id].connections[connection]];
    }
    ProjectElements[id].connections.splice(0,ProjectElements[id].connections.length-1);
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
        if (!(cell.isLink())) {
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
        id: string,
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
            //size: {width: 180, height: 50},
            position: elem.pos,
            attrs: {label: {text: elem.label, magnet: true}}
        });
        cls.addTo(graph);
    }
    for (let link of load.links) {
        let lnk = new joint.shapes.standard.Link({id: link.id});
        lnk.source({id: link.source});
        lnk.target({id: link.target});
        lnk.labels(link.labels);
        // @ts-ignore
        lnk.vertices(link.vertices);
        lnk.addTo(graph);
    }
}

export function exportModel(iri: string, type: string, knowledgeStructure: string, ksShort: string, callback: Function){
    const N3 = require('n3');
    const { namedNode, literal } = DataFactory;
    const writer = new N3.Writer({ prefixes: Prefixes });
    let name: string = ProjectSettings.name[Object.keys(ProjectSettings.name)[0]].trim().replace(/\s/g, '-');
    let projectIRI = iri + ksShort + "/" + name;
    let project = namedNode(projectIRI);
    let termObj: {[key:string]: string} = {};
    //type -zsgovmodel, ontology
    writer.addQuad(project, namedNode(parsePrefix("rdf","type")), namedNode(parsePrefix("owl", "Ontology")));
    writer.addQuad(project, namedNode(parsePrefix("rdf","type")), namedNode(parsePrefix("z-sgov-pojem","model")));
    writer.addQuad(project, namedNode(parsePrefix("rdf","type")), namedNode(knowledgeStructure));
    //label
    for (let lang of Object.keys(ProjectSettings.name)){
        if (ProjectSettings.name[lang].length > 0){
            writer.addQuad(project, namedNode(parsePrefix("skos","prefLabel")), literal(ProjectSettings.name[lang],lang));
        }
    }
    //imports
    for (let iri of Object.keys(Schemes)){
        writer.addQuad(project, namedNode(parsePrefix("owl","imports")), namedNode(iri));
    }

    for (let id of Object.keys(ProjectElements)){
        let iri = ProjectElements[id].iri;
        if (Array.isArray(ProjectElements[id].iri)){
            let cont = false;
            for (let iri of ProjectElements[id].iri){
                if (iri in Stereotypes){
                    cont = true;
                }
            }
            if (!cont) continue;
        } else {
            if (!((iri) in Stereotypes)) continue;
        }
        let elementName = ProjectElements[id].names[Object.keys(ProjectElements[id].names)[0]]
        for(let lang of Object.keys(ProjectElements[id].names)){
            if (ProjectElements[id].names[lang].length > 0){
                elementName = ProjectElements[id].names[lang];
                break;
            }
        }
        let stereotypeIRI = Array.isArray(ProjectElements[id].iri) ? ProjectElements[id].iri[0] : ProjectElements[id].iri;
        if (elementName === "") elementName = (LocaleMain.untitled + "-" + Stereotypes[stereotypeIRI].labels[Object.keys(Stereotypes[stereotypeIRI].labels)[0]]).trim().replace(/\s/g, '-');
        elementName = (projectIRI + "/pojem/" + elementName).trim().replace(/\s/g, '-');
        let count = 1;
        if (Object.values(termObj).includes(elementName)){
            while(Object.values(termObj).includes(elementName + "-" + count.toString(10))){
                count++;
            }
            elementName += "-" + count.toString(10);
        }
        termObj[id] = elementName;
    }

    for (let id of Object.keys(termObj)){
        let subject = namedNode(termObj[id]);
        //type
        //writer.addQuad(subject, namedNode(parsePrefix(Prefixes.rdf,"type")), namedNode(parsePrefix(Prefixes.skos,"Concept")));
        if (Array.isArray(ProjectElements[id].iri)){
            for (let iri of ProjectElements[id].iri){
                writer.addQuad(subject, namedNode(parsePrefix("rdf","type")), namedNode(iri));
            }
        } else {
            writer.addQuad(subject, namedNode(parsePrefix("rdf","type")), namedNode(ProjectElements[id].iri));
        }

        //prefLabel
        if (!(ProjectElements[id].untitled)){
            for (let lang of Object.keys(ProjectElements[id].names)){
                if (ProjectElements[id].names[lang].length > 0){
                    writer.addQuad(subject, namedNode(parsePrefix("skos","prefLabel")), literal(ProjectElements[id].names[lang],lang));
                }
            }
        }
        //rdfs:isDefinedBy
        writer.addQuad(subject, namedNode(parsePrefix("rdfs","isDefinedBy")), project);
        //relationships
        for (let conn of ProjectElements[id].connections){
            let targetIRI = termObj[ProjectLinks[conn].target];
            let predicateIRI = ProjectLinks[conn].iri;
            let length = 0;
            let pref = "";
            for (let prefix of Object.keys(Prefixes)){
                if (predicateIRI.startsWith(Prefixes[prefix])){
                    if (Prefixes[prefix].length > length){
                        length = Prefixes[prefix].length;
                        pref = prefix;
                    }
                }
            }
            if (length > 0) predicateIRI = pref + ":" + predicateIRI.substring(length);
            writer.addQuad(subject,namedNode(predicateIRI), namedNode(targetIRI));
        }
    }
    return writer.end((error: any, result: any)=>{callback(result);})
}

export function exportGlossary(iri: string, type: string, knowledgeStructure: string, ksShort: string, callback: Function){
    const N3 = require('n3');
    const { namedNode, literal } = DataFactory;
    const writer = new N3.Writer({ prefixes: Prefixes });
    let termObj: {[key:string]: string} = {};
    let name: string = ProjectSettings.name[Object.keys(ProjectSettings.name)[0]].trim().replace(/\s/g, "-");
    let glossaryIRI = iri + ksShort + "/" + name;
    let glossary = namedNode(glossaryIRI);
    writer.addQuad(glossary, namedNode(parsePrefix("rdf","type")), namedNode("z-sgov-pojem:glosář"));
    writer.addQuad(glossary, namedNode(parsePrefix("rdf","type")), namedNode(parsePrefix("skos","ConceptScheme")));
    writer.addQuad(glossary, namedNode(parsePrefix("rdf","type")), namedNode(knowledgeStructure));
    for (let lang of Object.keys(ProjectSettings.name)){
        if (ProjectSettings.name[lang].length > 0){
            writer.addQuad(glossary, namedNode(parsePrefix("skos","prefLabel")), literal(ProjectSettings.name[lang],lang));
        }
    }
    //imports
    for (let iri of Object.keys(Schemes)){
        writer.addQuad(glossary, namedNode(parsePrefix("owl","imports")), namedNode(iri));

        let scheme = namedNode(iri);
        writer.addQuad(scheme, namedNode(parsePrefix("rdf","type")), namedNode("z-sgov-pojem:glosář"));
        writer.addQuad(scheme, namedNode(parsePrefix("rdf","type")), namedNode(parsePrefix("skos","ConceptScheme")));
        writer.addQuad(scheme, namedNode(parsePrefix("rdf","type")), namedNode(knowledgeStructure));
        for (let lang of Object.keys(ProjectSettings.name)){
            if (ProjectSettings.name[lang].length > 0){
                writer.addQuad(scheme, namedNode(parsePrefix("skos","prefLabel")), literal(ProjectSettings.name[lang],lang));
            }
        }
    }

    for (let id of Object.keys(ProjectElements)){
        let iri = ProjectElements[id].iri;
        if (!((iri) in Stereotypes)) continue;
        let elementName = ProjectElements[id].names[Object.keys(ProjectElements[id].names)[0]]
        for(let lang of Object.keys(ProjectElements[id].names)){
            if (ProjectElements[id].names[lang].length > 0){
                elementName = ProjectElements[id].names[lang];
                break;
            }
        }
        if (elementName === "") elementName = (LocaleMain.untitled + "-" + Stereotypes[iri].labels[Object.keys(Stereotypes[iri].labels)[0]]).trim().replace(/\s/g, '-');
        elementName = (glossaryIRI + "/pojem/" + elementName).trim().replace(/\s/g, '-');
        let count = 1;
        if (Object.values(termObj).includes(elementName)){
            while(Object.values(termObj).includes(elementName + "-" + count.toString(10))){
                count++;
            }
            elementName += "-" + count.toString(10);
        }
        termObj[id] = elementName;
    }

    for (let id of Object.keys(termObj)){
        let subject = namedNode(termObj[id]);
        //type
        writer.addQuad(subject, namedNode(parsePrefix("rdf","type")), namedNode(parsePrefix("skos","Concept")));
        //prefLabel
        if (!(ProjectElements[id].untitled)){
            for (let lang of Object.keys(ProjectElements[id].names)){
                if (ProjectElements[id].names[lang].length > 0){
                    writer.addQuad(subject, namedNode(parsePrefix("skos","prefLabel")), literal(ProjectElements[id].names[lang],lang));
                }
            }
        }
        //rdfs:isDefinedBy
        writer.addQuad(subject, namedNode(parsePrefix("skos","inScheme")), namedNode(ProjectElements[id].scheme));
    }
    return writer.end((error: any, result: any)=>{callback(result);})
}