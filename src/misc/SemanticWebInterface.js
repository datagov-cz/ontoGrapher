import {
    AttributeTypePool,
    CardinalityPool,
    GeneralizationPool,
    LanguagePool,
    StereotypePool
} from "../config/Variables";
import {OntoDiagramModel} from "../diagram/OntoDiagramModel";
import React from "react";
import {Defaults} from "../config/Defaults";
import {Locale} from "../config/Locale";
import {LinkPool} from "../config/LinkVariables";

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
                    if (node.object.language === Defaults.stereotypeLanguage) {
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
        for (let constraint in LinkPool[link][3]) {
            annotations.push({
                source: "http://www.eclipse.org/ocl/examples/OCL",
                details: {
                    key: "constraint",
                    value: constraint
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
            name: cardinality,
            eSuperTypes: [eCoreCardinality]
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
    eCoreR.parse(source, eCore.XMI);
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

export function validateSettingsWithModel(model: OntoDiagramModel, source: string) {
    let linkPool = [];
    let stereotypePool = [];
    let attributeTypePool = [];
    let languagePool = [];
    let cardinalityPool = [];

    let nodes = model.getNodes();
    let links = model.getLinks();

    for (let node in nodes) {
        let nodeData = {
            rdf: nodes[node].rdf,
            name: nodes[node].stereotype
        };
        if (!stereotypePool.includes(nodeData)) {
            stereotypePool.push(nodeData);
        }
        for (let attributeLanguage in nodes[node].attributes) {
            if (!languagePool.includes(attributeLanguage)) {
                languagePool.push(attributeLanguage);
            }
            for (let attribute of nodes[node].attributes[attributeLanguage]) {
                if (!attributeTypePool.includes(attribute.second)) {
                    attributeTypePool.push(attribute.second);
                }
            }
        }
    }

    for (let link in links) {
        if (!cardinalityPool.includes(links[link].sourceCardinality)) {
            cardinalityPool.push(links[link].sourceCardinality);
        }
        if (!cardinalityPool.includes(links[link].targetCardinality)) {
            cardinalityPool.push(links[link].targetCardinality);
        }
        let linkData = {
            name: links[link].linkType,
            linkEnd: links[link].linkEnd,
            labeled: links[link].labeled,
            dashed: links[link].dashed,
            OCL: links[link].constraints,
        };
        if (!linkPool.includes(linkData)) {
            linkPool.push(linkData);
        }
    }

    let compareArray = fetchSettings(source);
    let errors = [];

    let linkPoolCompare = [];
    let stereotypePoolCompare = [];
    let attributeTypePoolCompare = [];
    let languagePoolCompare = [];
    let cardinalityPoolCompare = [];

    for (let item of compareArray) {
        if ("type" in item) {
            switch (item.type) {
                case "Stereotype":
                    stereotypePoolCompare.push({
                        rdf: item.annotations[0].value[0],
                        name: item.name
                    });
                    break;
                case "Relationship":
                    let specs = [];
                    let constraints = [];
                    for (let i = 0; i < item.annotations.length; i++) {
                        if (i < 3) {
                            specs.push(item.annotations[i].value[0]);
                        } else {
                            constraints.push(item.annotations[i].value[0]);
                        }
                    }
                    linkPoolCompare.push({
                        name: link.name,
                        linkEnd: specs[0],
                        labeled: specs[1],
                        dashed: specs[2],
                        OCL: constraints
                    });
                    break;
                case "AttributeType":
                    attributeTypePoolCompare.push(item.name);
                    break;
                case "Cardinality":
                    cardinalityPoolCompare.push(item.name);
                    break;
                case "Language":
                    languagePoolCompare.push(item.annotations[0].value[0]);
                    break;
            }
        }
    }

    for (let link of linkPool) {
        if (!linkPoolCompare.includes(link)) {
            errors.push(Locale.errorRelationshipNotFoundOrIncorrect + " " + link.name + " " + Locale.errorInInternalMetamodel);
        }
    }

    for (let attributeType of attributeTypePool) {
        if (!attributeTypePoolCompare.includes(attributeType)) {
            errors.push(Locale.errorAttributeTypeNotFound + " " + attributeType + " " + Locale.errorInInternalMetamodel);
        }
    }

    for (let cardinality of cardinalityPool) {
        if (!cardinalityPoolCompare.includes(cardinality)) {
            errors.push(Locale.errorCardinalityNotFound + " " + cardinality + " " + Locale.errorInInternalMetamodel);
        }
    }

    for (let language of languagePool) {
        if (!languagePoolCompare.includes(language)) {
            errors.push(Locale.errorAttributeTypeNotFound + " " + language + " " + Locale.errorInInternalMetamodel);
        }
    }

    for (let stereotype of stereotypePool) {
        if (!stereotypePoolCompare.includes(stereotype)) {
            errors.push(Locale.errorStereotypeNotFoundOrIncorrect + " " + stereotype.name + " " + Locale.errorInInternalMetamodel);
        }
    }

    return errors;

}

export function validateSettingsWithCurrentSettings(source: string) {
    let compareArray = fetchSettings(source);
    let errors = [];
    for (let item in compareArray) {
        if ("type" in item) {
            switch (item.type) {
                case "Stereotype":
                    if (!(item.annotations[0].value[0]) in StereotypePool) {
                        errors.push(Locale.errorStereotypeSourceNotFound + " " + item.annotations[0].value[0] + " " + Locale.errorInExternalMetamodel);
                    } else if (StereotypePool[item.annotations[0].value[0]] !== item.name) {
                        errors.push(Locale.errorStereotypeNameNotFound + " " + item.annotations[0].value[0] + " " + Locale.errorInExternalMetamodel);
                    }
                    break;
                case "Relationship":
                    if (!(item.name) in LinkPool) {
                        errors.push(Locale.errorRelationshipNameNotFound + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    } else if (item.annotations[0].value[0] !== LinkPool[item.name] || item.annotations[1].value[0] !== LinkPool[item.name] || item.annotations[2].value[0] !== LinkPool[item.name]) {
                        errors.push(Locale.errorRelationshipWrongVisualSettings + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    } else if (item.annotations.length - 3 === LinkPool[item.name][3].length) {
                        errors.push(Locale.errorWrongNumberOfOCLConstraints + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    } else {
                        for (let i = 3; i < item.annotations.length; i++) {
                            if (item.annotations.length[i] !== LinkPool[item.name][3][i - 3]) {
                                errors.push(Locale.errorWrongOCLConstraint + " " + item.name + " " + Locale.errorInExternalMetamodel);
                            }
                        }
                    }
                    break;
                case "AttributeType":
                    if (!AttributeTypePool.includes(item.name)) {
                        errors.push(Locale.errorAttributeTypeNotFound + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    }
                    break;
                case "Cardinality":
                    if (!CardinalityPool.includes(item.name)) {
                        errors.push(Locale.errorCardinalityNotFound + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    }
                    break;
                case "Language":
                    if (!(item.annotations[0].value[0]) in LanguagePool)
                        errors.push(Locale.errorLanguageNotFound + " " + item.type + " " + Locale.errorInExternalMetamodel);
                    break;
                default:
                    errors.push(Locale.errorUnknownType + " " + item.type + " " + Locale.errorInExternalMetamodel);
            }
        }
    }
    return errors;
}

export function importSettings(source: string) {
    let array = fetchSettings(source);

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
                            constraints.push(item.annotations[i].value[0]);
                        }
                    }
                    specs.push(constraints);
                    LinkPool[item.name] = specs;
                    break;
                case "AttributeType":

                    AttributeTypePool.push(item.name);
                    break;
                case "Cardinality":
                    CardinalityPool.push(item.name);
                    break;
                case "Language":
                    LanguagePool[item.annotations[0].value[0]] = item.name;
                    break;
            }
        }
    }


}

export function exportDiagram(model: OntoDiagramModel) {
    // const rdf = require('rdf-ext');
    // const SerializerNtriples = require('@rdfjs/serializer-ntriples');
    //
    // let dataset = rdf.dataset();
    // let diagram = this.engine.getDiagramModel().serializeDiagram();
    // for (let node of diagram.nodes) {
    //     dataset.add(rdf.quad(rdf.namedNode(node.rdf), rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode("http://www.w3.org/2002/07/owl#Class")));
    //     dataset.add(rdf.quad(rdf.namedNode(node.rdf), rdf.namedNode("http://www.w3.org/2000/01/rdf-schema#label"), rdf.literal(node.stereotype)));
    // }
    // const serializerNtriples = new SerializerNtriples();
    // const input = dataset.toStream();
    // const output = serializerNtriples.import(input);
    // output.on('data', ntriples => {
    //     callback(ntriples.toString());
    // });

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
                let skosPrefLabel = doc.createElement("skos:prefLabel");
                skosPrefLabel.innerHTML = modelNodes[node].names[language] + "@" + language;
                nodeNameClass.appendChild(skosPrefLabel);
            }
            if (modelNodes[node].notes[language] !== undefined) {
                let skosNote = doc.createElement("skos:note");
                skosNote.innerHTML = modelNodes[node].notes[language] + "@" + language;
                nodeNameClass.appendChild(skosNote);
            }
        }
        nodeNameDeclaration.appendChild(nodeNameClass);
        ontology.appendChild(nodeNameDeclaration);
    }

    //attribute name declarations
    for (let node in modelNodes) {
        for (let i = 0; i < Object.keys(modelNodes[node].attributes).length; i++) {
            let attrNameDeclaration = doc.createElement("Declaration");
            let attrNameClass = doc.createElement("Class");
            attrNameClass.setAttribute("IRI", "#" + modelNodes[node].id + "-attr" + i);
            for (let language in LanguagePool) {
                let skosPrefLabel = doc.createElement("skos:prefLabel");
                skosPrefLabel.innerHTML = modelNodes[node].attributes[language][i] + "@" + language;
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
                    if (link.linkType === "Generalization") {
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

    //subclasses
    for (let link in modelLinks) {
        let subClassOf = doc.createElement("SubClassOf");
        let classSource = doc.createElement("Class");
        let classTarget = doc.createElement("Class");
        classSource.setAttribute("IRI", "#" + modelLinks[link].getSourcePort().getParent().id);
        classTarget.setAttribute("IRI", "#" + modelLinks[link].getTargetPort().getParent().id);
        if (modelLinks[link].sourceCardinality === modelLinks[link].targetCardinality) {
            if (modelLinks[link].sourceCardinality === Locale.none && modelLinks[link].linkType === "Generalization") {
                subClassOf.appendChild(classSource);
                subClassOf.appendChild(classTarget);
            } else if (modelLinks[link].sourceCardinality !== Locale.none) {
                let objectExactCardinality = doc.createElement("ObjectExactCardinality");
                objectExactCardinality.setAttribute("cardinality", modelLinks[link].sourceCardinality);
                let objectProperty = doc.createElement("ObjectProperty");
                objectProperty.setAttribute("IRI", "#" + modelLinks[link].getTargetPort().getParent().id);
                objectExactCardinality.appendChild(objectProperty);
                objectExactCardinality.appendChild(classTarget);
                subClassOf.appendChild(classSource);
                subClassOf.appendChild(objectExactCardinality);

                let subClassOf2 = doc.createElement("SubClassOf");
                let classSource2 = doc.createElement("Class");
                let classTarget2 = doc.createElement("Class");
                classSource2.setAttribute("IRI", "#" + modelLinks[link].getSourcePort().getParent().id);
                classTarget2.setAttribute("IRI", "#" + modelLinks[link].getTargetPort().getParent().id);

                let objectExactCardinality2 = doc.createElement("ObjectExactCardinality");
                objectExactCardinality2.setAttribute("cardinality", modelLinks[link].sourceCardinality);
                let objectProperty2 = doc.createElement("ObjectProperty");
                objectProperty2.setAttribute("IRI", "#" + modelLinks[link].getSourcePort().getParent().id);
                objectExactCardinality2.appendChild(objectProperty2);
                objectExactCardinality2.appendChild(classSource2);
                subClassOf2.appendChild(classTarget2);
                subClassOf2.appendChild(objectExactCardinality2);
                ontology.appendChild(subClassOf2);
            }
        } else {

        }


        ontology.appendChild(subClassOf);
    }

    //attribute type declarations
    for (let attrType of AttributeTypePool) {
        let attrTypeDeclaration = doc.createElement("Declaration");
        let attrTypeDataProperty = doc.createElement("DataProperty");
        attrTypeDataProperty.setAttribute("IRI", "#" + attrType);
        attrTypeDeclaration.appendChild(attrTypeDataProperty);
        ontology.appendChild(attrTypeDeclaration);
    }

    doc.appendChild(ontology);
    return doc;

    // for (let node in modelNodes) {
    //     let modelNode = modelNodes[node];
    //
    //     let classNodeLinks = {};
    //     let classNodePorts = [];
    //     for (let port in modelNode.getPorts()) {
    //         classNodePorts.push(modelNode.getPorts()[port]);
    //         Helper.mergeObjects(classNodeLinks,modelNode.getPorts()[port].getLinks());
    //     }
    //
    //
    //
    // }


    // let modelNodes = model.getNodes();
    // let modelLinks = model.getLinks();
    //
    // let jsonLDexport = {};
    //
    // jsonLDexport["@context"] = {
    //     "rdf" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    //     "owl" : "http://www.w3.org/2002/07/owl#",
    //     "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    //     "xsd": "http://www.w3.org/2001/XMLSchema#",
    //     "skos" : "http://www.w3.org/2004/02/skos/core#"
    // };
    //
    // jsonLDexport["@id"] = id;
    // jsonLDexport["@type"] = "owl:Ontology";
    // jsonLDexport["rdf:label"] = model.name;
    //
    // jsonLDexport["@graph"] = [];
    // for (let node in modelNodes){
    //     let modelNode = modelNodes[node];
    //     let classNode = {};
    //     classNode["@id"] = modelNode.names[0];
    //     classNode["@type"] = "owl:Class";
    //
    //     let classNodeLinks = [];
    //     let classNodePorts = [];
    //     for (let port in modelNode.getPorts()){
    //         classNodePorts.push(modelNode.getPorts()[port]);
    //         classNodeLinks.concat(modelNode.getPorts()[port].getLinks());
    //     }
    //
    //     //subclasses
    //     classNode["owl:SubClassOf"] = [];
    //     classNode["owl:DisjointClass"] = [];
    //     for (let link in classNodeLinks){
    //         if (link.linkType === "Generalization"){
    //             if (classNodePorts.includes(link.getSourcePort())){
    //                 let sourceNode = link.getTargetPort().getNode();
    //                 classNode["owl:SubClassOf"].push(sourceNode.names[0]);
    //
    //             }
    //         }
    //     }
    //
    //
    // }
    //return jsonLDexport;
}