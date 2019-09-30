import {
    AttributeTypePool,
    CardinalityPool,
    GeneralizationPool,
    LanguagePool,
    StereotypePool
} from "../config/Variables";
import {OntoDiagramModel} from "../diagram/OntoDiagramModel";
import React from "react";
import {Locale} from "../config/Locale";
import {LinkPool} from "../config/LinkVariables";
import {Constraint} from "../components/misc/Constraint";
import {Config} from "../config/Config";
import * as Helper from "./Helper";
import {Cardinality} from "../components/misc/Cardinality";

export function fetchStereotypes(source: string, replace: boolean, callback) {
    const rdf = require('rdf-ext');
    const rdfFetch = require('rdf-fetch');
    let stereotypes = {};
    rdfFetch(source).then((res) => {
        return res.dataset();
    }).then((dataset) => {
        const classes = dataset.match(null, null, rdf.namedNode("http://www.w3.org/2002/07/owl#Class"));
        let result = {};
        for (let quad of classes.toArray()) {
            if (quad.subject instanceof rdf.defaults.NamedNode) {
                result[quad.subject.value] = dataset.match(rdf.namedNode(quad.subject.value));
            }
        }
        return result;
    }).then((res) => {
        for (let quad in res) {
            for (let node of res[quad].toArray()) {
                if (node.object instanceof rdf.defaults.Literal && node.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label") {
                    if (node.object.language === Config.stereotypeLanguage) {
                        stereotypes[node.subject.value] = node.object.value;
                    }
                }
            }
        }

        if (replace) {
            for (let stereotype in StereotypePool) {
                delete StereotypePool[stereotype];
            }
        }

        for (let stereotype in stereotypes) {
            StereotypePool[stereotype] = stereotypes[stereotype];
        }
        callback();
    }).catch((err) => {
        console.error(err.stack || err.message);
    });
}

export function exportSettings(name: string, prefix: string, URI: string) {
    const eCore = require('ecore/dist/ecore.xmi');

    let eCorePackage = eCore.EPackage.create({
        name: name,
        nsPrefix: prefix,
        nsURI: URI
    });

    let eCoreStereotype = eCore.EClass.create({
        name: "Stereotype",
        abstract: true
    });

    let eCoreRelationship = eCore.EClass.create({
        name: "Relationship",
        abstract: true
    });

    let eCoreAttributeType = eCore.EClass.create({
        name: "AttributeType",
        abstract: true
    });

    let eCoreCardinality = eCore.EClass.create({
        name: "Cardinality",
        abstract: true
    });

    let eCoreLanguage = eCore.EClass.create({
        name: "Language",
        abstract: true
    });
    eCorePackage.get('eClassifiers').add(eCoreStereotype);
    eCorePackage.get('eClassifiers').add(eCoreRelationship);
    eCorePackage.get('eClassifiers').add(eCoreAttributeType);
    eCorePackage.get('eClassifiers').add(eCoreCardinality);
    eCorePackage.get('eClassifiers').add(eCoreLanguage);

    for (let stereotype in StereotypePool) {
        let eCoreS = eCore.EClass.create({
            name: StereotypePool[stereotype],
            eSuperTypes: [eCoreStereotype],
            eAnnotations: [
                {
                    source: "http://www.w3.org/1999/02/22-rdf-syntax-ns",
                    details: {
                        key: "rdf",
                        value: stereotype
                    }
                }
            ]
        });

        eCorePackage.get('eClassifiers').add(eCoreS);
    }

    for (let link in LinkPool) {
        let annotations = [];
        annotations.push({
            source: "linkEnd",
            details: {
                key: "linkEnd",
                value: LinkPool[link][0]
            }
        });
        annotations.push({
            source: "labeled",
            details: {
                key: "labeled",
                value: LinkPool[link][1]
            }
        });
        annotations.push({
            source: "dashed",
            details: {
                key: "dashed",
                value: LinkPool[link][2]
            }
        });
        for (let constraint of LinkPool[link][3]) {
            annotations.push({
                source: "http://www.eclipse.org/ocl/examples/OCL",
                details: {
                    key: "constraint",
                    value: constraint.statement
                }
            });
        }
        let eCoreL = eCore.EClass.create({
            name: link,
            eSuperTypes: [eCoreRelationship],
            eAnnotations: annotations
        });
        eCorePackage.get('eClassifiers').add(eCoreL);
    }

    for (let attrType of AttributeTypePool) {
        let eCoreAT = eCore.EClass.create({
            name: attrType,
            eSuperTypes: [eCoreAttributeType]
        });
        eCorePackage.get('eClassifiers').add(eCoreAT);
    }

    for (let cardinality of CardinalityPool) {
        let eCoreC = eCore.EClass.create({
            name: cardinality.getString(),
            eSuperTypes: [eCoreCardinality],
            eAnnotations: [
                {
                    source: "firstCardinality",
                    details: {
                        key: "firstCardinality",
                        value: cardinality.getFirstCardinality()
                    }
                },
                {
                    source: "secondCardinality",
                    details: {
                        key: "secondCardinality",
                        value: cardinality.getSecondCardinality()
                    }
                }
            ]
        });
        eCorePackage.get('eClassifiers').add(eCoreC);
    }

    for (let language in LanguagePool) {
        let eCoreLang = eCore.EClass.create({
            name: LanguagePool[language],
            eSuperTypes: [eCoreLanguage],
            eAnnotations: [
                {
                    source: "code",
                    details: {
                        key: "code",
                        value: language
                    }
                }
            ]
        });
        eCorePackage.get('eClassifiers').add(eCoreLang);
    }

    let eCoreResourceSet = eCore.ResourceSet.create();
    let resource = eCoreResourceSet.create({uri: URI});
    resource.get('contents').add(eCorePackage);
    return resource.to(eCore.XMI, true);
}

export function fetchSettings(source: string) {
    const eCore = require('ecore/dist/ecore.xmi');
    let eCoreRS = eCore.ResourceSet.create();
    let eCoreR = eCoreRS.create({uri: 'URI'});

    try {
        eCoreR.parse(source, eCore.XMI);
    } catch(err){
        console.log(err);
        return false;
    }

    let eCorePackage = eCoreR.get('contents').first();

    let array = eCorePackage.get('eClassifiers').map(function (item) {
            return {
                name: item.get('name'),
                type: item.get('eSuperTypes').map(function (item) {
                    return item.get('name');
                })[0],
                annotations: item.get('eAnnotations').map(function (item) {
                    return ({
                        source: item.get('source'),
                        key: item.get('details').map(function (item) {
                            return item.get('key');
                        }),
                        value:
                            item.get('details').map(function (item) {
                                return item.get('value');
                            })
                    });
                })
            };

        }
    );

    return array;
}

export function importSettings(source: string) {
    let array = fetchSettings(source);

    if (!array){
        return false;
    }

    for (let language in LanguagePool) {
        delete LanguagePool[language];
    }

    CardinalityPool.length = 0;
    AttributeTypePool.length = 0;

    for (let stereotype in StereotypePool) {
        delete StereotypePool[stereotype];
    }

    for (let link in LinkPool) {
        delete LinkPool[link];
    }

    for (let item of array) {
        if ("type" in item) {
            switch (item.type) {
                case "Stereotype":
                    StereotypePool[item.annotations[0].value[0]] = item.name;
                    break;
                case "Relationship":
                    let specs = [];
                    let constraints = [];
                    for (let i = 0; i < item.annotations.length; i++) {
                        if (i < 3) {
                            specs.push(item.annotations[i].value[0]);
                        } else {
                            constraints.push(new Constraint(item.annotations[i].value[0],item.name));
                        }
                    }
                    specs[1] = Helper.convertStringToBoolean(specs[1]);
                    specs[2] = Helper.convertStringToBoolean(specs[2]);
                    specs.push(constraints);
                    LinkPool[item.name] = specs;
                    break;
                case "AttributeType":

                    AttributeTypePool.push(item.name);
                    break;
                case "Cardinality":
                    CardinalityPool.push(new Cardinality(item.annotations[0].value[0],item.annotations[1].value[0]));
                    break;
                case "Language":
                    LanguagePool[item.annotations[0].value[0]] = item.name;
                    break;
            }
        }
    }

    return true;
}

export function exportDiagram(model: OntoDiagramModel) {

    let modelNodes = model.getNodes();
    let modelLinks = model.getLinks();

    let doc = document.implementation.createDocument("", "", null);

    let ontology = doc.createElement("Ontology");
    ontology.setAttribute("xmlns", "http://www.w3.org/2002/07/owl#");
    ontology.setAttribute("xmlns:rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    ontology.setAttribute("xmlns:xml", "http://www.w3.org/XML/1998/namespace");
    ontology.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema#");
    ontology.setAttribute("xmlns:rdfs", "http://www.w3.org/2000/01/rdf-schema#");

    //model name declarations
    for (let node in modelNodes) {
        let nodeNameDeclaration = doc.createElement("Declaration");
        let nodeNameClass = doc.createElement("Class");
        nodeNameClass.setAttribute("IRI", "#" + modelNodes[node].id);
        for (let language in LanguagePool) {
            if (modelNodes[node].names[language] !== undefined) {
                let skosPrefLabel = doc.createElement("skos:label");
                let innerHTML = modelNodes[node].names[language] + "@" + language;
                skosPrefLabel.innerHTML = innerHTML;
                nodeNameClass.appendChild(skosPrefLabel);
            }
            if (modelNodes[node].notes[language] !== undefined) {
                let skosNote = doc.createElement("skos:note");
                let innerHTML = modelNodes[node].notes[language] + "@" + language;
                skosNote.innerHTML = innerHTML;
                nodeNameClass.appendChild(skosNote);
            }
        }
        nodeNameDeclaration.appendChild(nodeNameClass);
        ontology.appendChild(nodeNameDeclaration);
    }

    //attribute name declarations
    for (let node in modelNodes) {
        for (let i = 0; i < Object.keys(modelNodes[node].attributes[model.language]).length; i++) {
            let attrNameDeclaration = doc.createElement("Declaration");
            let attrNameClass = doc.createElement("Class");
            attrNameClass.setAttribute("IRI", "#" + modelNodes[node].id + "-attr" + i);
            for (let language in LanguagePool) {
                let skosPrefLabel = doc.createElement("rdfs:label");
                skosPrefLabel.innerHTML = modelNodes[node].attributes[language][i].first + "@" + language;
                attrNameClass.appendChild(skosPrefLabel);
            }
            attrNameDeclaration.appendChild(attrNameClass);
            ontology.appendChild(attrNameDeclaration);
        }
    }

    //attribute domain and range
    for (let node in modelNodes) {
        for (let i = 0; i < Object.keys(modelNodes[node].attributes[model.language]).length; i++) {
            let attrDomain = doc.createElement("DataPropertyDomain");
            let attrDataProperty = doc.createElement("DataProperty");
            let attrRange = doc.createElement("DataPropertyRange");
            let className = doc.createElement("Class");
            let datatype = doc.createElement("Datatype");
            datatype.setAttribute("IRI", "#" + modelNodes[node].attributes[model.language][i].second);
            className.setAttribute("IRI", "#" + modelNodes[node].id);
            attrDataProperty.setAttribute("IRI", "#" + modelNodes[node].id + "-attr" + i);

            attrRange.appendChild(datatype);
            attrRange.appendChild(attrDataProperty);
            attrDomain.appendChild(attrDataProperty);
            attrDomain.appendChild(className);
            ontology.appendChild(attrDomain);
        }
    }

    //equivalent classes
    for (let generalization in GeneralizationPool) {
        if (GeneralizationPool[generalization].length > 0) {
            let equivalentClasses = doc.createElement("EquivalentClasses");
            let objectUnionOf = doc.createElement("ObjectUnionOf");
            for (let node in GeneralizationPool[generalization]) {
                let className = doc.createElement("Class");
                className.setAttribute("IRI", "#" + node.id);
                objectUnionOf.appendChild(className);
            }
            let superClass = doc.createElement("Class");
            let interNode = GeneralizationPool[generalization][0];
            for (let port in interNode.ports) {
                for (let link in interNode.ports[port].links) {
                    if (link.linkType === Locale.generalization) {
                        if (link.getSourcePort() in Object.values(interNode.ports)) {
                            superClass.setAttribute("IRI", "#" + interNode.ports[port].links[link].getTargetPort().getParent().id);
                            break;
                        }
                    }
                }
            }
            equivalentClasses.appendChild(superClass);
            ontology.appendChild(equivalentClasses);
        }
    }

        // else if (modelLinks[link].sourceCardinality !== Locale.none) {
        // let objectExactCardinality = doc.createElement("ObjectExactCardinality");
        // objectExactCardinality.setAttribute("cardinality", modelLinks[link].sourceCardinality);
        // let objectProperty = doc.createElement("ObjectProperty");
        // objectProperty.setAttribute("IRI", "#" + modelLinks[link].getTargetPort().getParent().id);
        // objectExactCardinality.appendChild(objectProperty);
        // objectExactCardinality.appendChild(classTarget);
        // subClassOf.appendChild(classSource);
        // subClassOf.appendChild(objectExactCardinality);
        //
        // let subClassOf2 = doc.createElement("SubClassOf");
        // let classSource2 = doc.createElement("Class");
        // let classTarget2 = doc.createElement("Class");
        // classSource2.setAttribute("IRI", "#" + modelLinks[link].getSourcePort().getParent().id);
        // classTarget2.setAttribute("IRI", "#" + modelLinks[link].getTargetPort().getParent().id);
        //
        // let objectExactCardinality2 = doc.createElement("ObjectExactCardinality");
        // objectExactCardinality2.setAttribute("cardinality", modelLinks[link].sourceCardinality);
        // let objectProperty2 = doc.createElement("ObjectProperty");
        // objectProperty2.setAttribute("IRI", "#" + modelLinks[link].getSourcePort().getParent().id);
        // objectExactCardinality2.appendChild(objectProperty2);
        // objectExactCardinality2.appendChild(classSource2);
        // subClassOf2.appendChild(classTarget2);
        // subClassOf2.appendChild(objectExactCardinality2);
        // ontology.appendChild(subClassOf2);
        //}

    //subclasses
    for (let link in modelLinks) {
        if (modelLinks[link].getTargetPort() === null || modelLinks[link].getTargetPort() === undefined){
            continue;
        }
        let subClassOf1 = doc.createElement("SubClassOf");
        let subClassOf2 = doc.createElement("SubClassOf");
        let append2 = false;
        let sourceID = "#" + modelLinks[link].getSourcePort().getParent().id;
        let targetID = "#" + modelLinks[link].getTargetPort().getParent().id;
        let sourceCardinality = modelLinks[link].sourceCardinality;
        let targetCardinality = modelLinks[link].targetCardinality;
        let classSource = doc.createElement("Class");
        let classTarget = doc.createElement("Class");
        let objectPropertySource = doc.createElement("ObjectProperty");
        let objectPropertyTarget = doc.createElement("ObjectProperty");
        classSource.setAttribute("IRI", sourceID);
        classTarget.setAttribute("IRI", targetID);
        objectPropertySource.setAttribute("IRI", sourceID);
        objectPropertyTarget.setAttribute("IRI", targetID);
        if (sourceCardinality === targetCardinality && sourceCardinality === Locale.none && modelLinks[link].linkType === Locale.generalization) {
            //generalizations
            subClassOf1.appendChild(classSource);
            subClassOf1.appendChild(classTarget);
        } else {
            append2 = true;
            let sourceFirstNumber = parseInt(sourceCardinality.charAt(0));
            let sourceSecondNumber = parseInt(sourceCardinality.charAt(sourceCardinality.length-1));
            let targetFirstNumber = parseInt(targetCardinality.charAt(0));
            let targetSecondNumber = parseInt(targetCardinality.charAt(targetCardinality.length-1));

            if (isNaN(sourceFirstNumber) || isNaN(targetFirstNumber)){
                continue;
            }

            //source cardinality
            if (sourceFirstNumber === sourceSecondNumber){
                //sole number - exact cardinality
                let objectExactCardinality = doc.createElement("ObjectExactCardinality");
                objectExactCardinality.setAttribute("cardinality",sourceFirstNumber);
                objectExactCardinality.appendChild(objectPropertyTarget);
                objectExactCardinality.appendChild(classTarget);
                subClassOf1.appendChild(classSource);
                subClassOf1.appendChild(objectExactCardinality);
            } else if (!isNaN(sourceSecondNumber)){
                //ends with number - max cardinality
                let objectMaxCardinality = doc.createElement("ObjectMaxCardinality");
                objectMaxCardinality.setAttribute("cardinality",sourceSecondNumber);
                objectMaxCardinality.appendChild(objectPropertyTarget);
                objectMaxCardinality.appendChild(classTarget);
                subClassOf1.appendChild(classSource);
                subClassOf1.appendChild(objectMaxCardinality);
            } else if (isNaN(sourceSecondNumber)){
                //ends with star - some values from
                let objectSomeValuesFrom = doc.createElement("ObjectSomeValuesFrom");
                objectSomeValuesFrom.appendChild(objectPropertyTarget);
                objectSomeValuesFrom.appendChild(classTarget);
                subClassOf1.appendChild(classSource);
                subClassOf1.appendChild(objectSomeValuesFrom);
            } else {
                continue;
            }

            //target cardinality
            if (targetFirstNumber === targetSecondNumber){
                //sole number - exact cardinality
                let objectExactCardinality = doc.createElement("ObjectExactCardinality");
                objectExactCardinality.setAttribute("cardinality",targetFirstNumber);
                objectExactCardinality.appendChild(objectPropertyTarget);
                objectExactCardinality.appendChild(classSource);
                subClassOf2.appendChild(classTarget);
                subClassOf2.appendChild(objectExactCardinality);
            } else if (!isNaN(targetSecondNumber)){
                //ends with number - max cardinality
                let objectMaxCardinality = doc.createElement("ObjectMaxCardinality");
                objectMaxCardinality.setAttribute("cardinality",targetSecondNumber);
                objectMaxCardinality.appendChild(objectPropertyTarget);
                objectMaxCardinality.appendChild(classSource);
                subClassOf2.appendChild(classTarget);
                subClassOf2.appendChild(objectMaxCardinality);
            } else if (isNaN(targetSecondNumber)){
                //ends with star - some values from
                let objectSomeValuesFrom = doc.createElement("ObjectSomeValuesFrom");
                objectSomeValuesFrom.appendChild(objectPropertyTarget);
                objectSomeValuesFrom.appendChild(classSource);
                subClassOf2.appendChild(classTarget);
                subClassOf2.appendChild(objectSomeValuesFrom);
            } else {
                continue;
            }

        }

        ontology.appendChild(subClassOf1);
        if (append2){
            ontology.appendChild(subClassOf2);
        }


    }

    //attribute type declarations
    for (let attrType of AttributeTypePool) {
        let attrTypeDeclaration = doc.createElement("Declaration");
        let attrTypeDataProperty = doc.createElement("DataProperty");
        attrTypeDataProperty.setAttribute("IRI", "#" + attrType);
        attrTypeDeclaration.appendChild(attrTypeDataProperty);
        ontology.appendChild(attrTypeDeclaration);
    }

    //inverse object properties
    for (let link in modelLinks){
        if (modelLinks[link].sourceCardinality !== Locale.none && modelLinks[link].targetCardinality !== Locale.none && modelLinks[link].linkType !== Locale.generalization){
            let inverseObjectProperties = doc.createElement("InverseObjectProperties");
            let objectProperty1 = doc.createElement("ObjectProperty");
            objectProperty1.setAttribute("IRI", "#"+modelLinks[link].getSourcePort().getParent().id);
            let objectProperty2 = doc.createElement("ObjectProperty");
            objectProperty2.setAttribute("IRI", "#"+modelLinks[link].getTargetPort().getParent().id);
            inverseObjectProperties.appendChild(objectProperty1);
            inverseObjectProperties.appendChild(objectProperty2);
            ontology.appendChild(inverseObjectProperties);
        }
    }

    //disjoint classes
    for (let generalization in GeneralizationPool) {
        if (GeneralizationPool[generalization].length > 0) {
            let disjointClasses  = doc.createElement("DisjointClasses");
            for (let node of GeneralizationPool[generalization]){
                let disjointClass = doc.createElement("Class");
                disjointClass.setAttribute("IRI","#"+node.id);
                disjointClasses.appendChild(disjointClass);
            }
            ontology.appendChild(disjointClasses);
        }
    }

    //object property domain and range
    let rangeList = [];

    for (let link in modelLinks){
        if (modelLinks[link].linkType !== Locale.generalization && modelLinks[link].sourceCardinality !== Locale.none && modelLinks[link].targetCardinality !== Locale.none){
            let objectPropertyDomain1 = doc.createElement("ObjectPropertyDomain");
            let objectProperty1 = doc.createElement("ObjectProperty");
            let class1 = doc.createElement("Class");
            objectProperty1.setAttribute("IRI","#"+modelLinks[link].getSourcePort().getParent().id);
            class1.setAttribute("IRI", "#"+modelLinks[link].getTargetPort().getParent().id);
            objectPropertyDomain1.appendChild(objectProperty1);
            objectPropertyDomain1.appendChild(class1);

            let objectPropertyDomain2 = doc.createElement("ObjectPropertyDomain");
            let objectProperty2 = doc.createElement("ObjectProperty");
            let class2 = doc.createElement("Class");
            objectProperty2.setAttribute("IRI","#"+modelLinks[link].getTargetPort().getParent().id);
            class2.setAttribute("IRI", "#"+modelLinks[link].getSourcePort().getParent().id);
            objectPropertyDomain2.appendChild(objectProperty2);
            objectPropertyDomain2.appendChild(class1);

            ontology.appendChild(objectPropertyDomain1);
            ontology.appendChild(objectPropertyDomain2);

            if (rangeList.includes(modelLinks[link].getSourcePort().getParent().id)){
                rangeList.push(modelLinks[link].getSourcePort().getParent().id);
            }
            if (rangeList.includes(modelLinks[link].getTargetPort().getParent().id)){
                rangeList.push(modelLinks[link].getTargetPort().getParent().id);
            }
        }
    }

    for (let id of rangeList){
        let objectPropertyRange = doc.createElement("ObjectPropertyRange");
        let objectProperty = doc.createElement("ObjectProperty");
        let className = doc.createElement("Class");
        objectProperty.setAttribute("IRI","#"+id);
        className.setAttribute("IRI","#"+id);
        ontology.appendChild(objectPropertyRange);
    }

    doc.appendChild(ontology);
    return doc;

}