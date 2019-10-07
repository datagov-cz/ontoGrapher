import {AttributeTypePool, CardinalityPool, LanguagePool, StereotypePool} from "../config/Variables";
import {LinkPool} from "../config/LinkVariables";
import {Constraint} from "../components/misc/Constraint";
import * as Helper from "./Helper";
import {Cardinality} from "../components/misc/Cardinality";

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
    } catch (err) {
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

    if (!array) {
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
                            constraints.push(new Constraint(item.annotations[i].value[0], item.name));
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
                    CardinalityPool.push(new Cardinality(item.annotations[0].value[0], item.annotations[1].value[0]));
                    break;
                case "Language":
                    LanguagePool[item.annotations[0].value[0]] = item.name;
                    break;
            }
        }
    }

    return true;
}