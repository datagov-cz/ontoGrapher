import {OntoDiagramModel} from "../diagram/OntoDiagramModel";
import {Locale} from "../config/locale/Locale";
import {AttributeTypePool, CardinalityPool, LanguagePool, LinkPool, StereotypePool} from "../config/Variables";
import * as Helper from "./Helper";
import {fetchSettings} from "../interface/ImportExportInterface";
import {SourceData} from "../components/misc/SourceData";

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
            stereotype: nodes[node].stereotype
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
            iri: links[link].iri,
            description: links[link].description,
            source: links[link].source
        };
        if (!linkPool.includes(linkData)) {
            linkPool.push(linkData);
        }
    }

    let compareArray = fetchSettings(source);

    let errors = [];

    if (!compareArray) {
        errors.push(Locale.errorImport);
        return errors;
    }

    let linkPoolCompare = [];
    let stereotypePoolCompare = [];
    let attributeTypePoolCompare = {};
    let languagePoolCompare = {};
    let cardinalityPoolCompare = [];

    for (let item of compareArray) {
        if ("type" in item) {
            switch (item.type) {
                case "Stereotype":
                    stereotypePoolCompare.push({
                        iri: item.annotations[0].value[0],
                        name: item.name,
                        description: item.annotations[1].value[0],
                        source: item.annotations[2].value[0]
                    });
                    break;
                case "Relationship":
                    let specs = [];
                    let constraints = [];
                    for (let i = 0; i < item.annotations.length - 3; i++) {
                        if (i < 3) {
                            specs.push(item.annotations[i].value[0]);
                        } else {
                            constraints.push(item.annotations[i].value[0]);
                        }
                    }
                    specs.push(item.annotations[item.annotations.length - 3].value[0]);
                    specs.push(item.annotations[item.annotations.length - 2].value[0]);
                    specs.push(item.annotations[item.annotations.length - 1].value[0]);
                    linkPoolCompare.push({
                        name: item.name,
                        linkEnd: specs[0],
                        labeled: Helper.convertStringToBoolean(specs[1]),
                        dashed: Helper.convertStringToBoolean(specs[2]),
                        OCL: constraints,
                        iri: specs[3],
                        description: specs[4],
                        source: specs[5]
                    });
                    break;
                case "AttributeType":
                    attributeTypePoolCompare[item.name] = item.annotations[0].value[0];
                    break;
                case "Cardinality":
                    cardinalityPoolCompare.push(item.name);
                    break;
                case "Language":
                    languagePoolCompare[item.annotations[0].value[0]] = item.name;
                    break;
            }
        }
    }
    for (let link of linkPool) {
        let compareLink = undefined;
        for (let cLink of linkPoolCompare) {
            if (cLink.name === link.name) {
                compareLink = cLink;
                break;
            }
        }
        if (compareLink === undefined) {
            errors.push(Locale.errorRelationshipNotFoundOrIncorrect + " " + link.name + " " + Locale.errorInExternalMetamodel);
            continue;
        }
        if (compareLink.linkEnd !== link.linkEnd || compareLink.dashed !== link.dashed || compareLink.labeled !== link.labeled || compareLink.iri !== link.iri || compareLink.description !== link.description || compareLink.source !== link.source) {
            errors.push(Locale.errorRelationshipNotFoundOrIncorrect + " " + link.name + " " + Locale.errorInExternalMetamodel);
            continue;
        }
        if (compareLink.OCL.length !== link.OCL.length) {
            errors.push(Locale.errorWrongNumberOfOCLConstraints + " " + link.name + " " + Locale.errorInExternalMetamodel);
            continue;
        }
        for (let i = 0; i < compareLink.OCL.length; i++) {
            if (compareLink.OCL[i] !== link.OCL[i]) {
                errors.push(Locale.errorWrongOCLConstraint + " " + link.name + " " + Locale.errorInExternalMetamodel);
                break;
            }
        }
    }

    for (let attributeType of Object.keys(attributeTypePool)) {
        if (!Object.keys(attributeTypePoolCompare).includes(attributeType)) {
            errors.push(Locale.errorAttributeTypeNotFound + " " + attributeType + " " + Locale.errorInExternalMetamodel);
        }
    }

    for (let cardinality of cardinalityPool) {
        if (!cardinalityPoolCompare.includes(cardinality)) {
            errors.push(Locale.errorCardinalityNotFound + " " + cardinality + " " + Locale.errorInExternalMetamodel);
        }
    }

    for (let language of Object.keys(languagePool)) {
        if (!Object.keys(languagePoolCompare).includes(language)) {
            errors.push(Locale.errorAttributeTypeNotFound + " " + language + " " + Locale.errorInExternalMetamodel);
        }
    }

    for (let stereotype of stereotypePool) {
        let stereotypeCompare = undefined;
        for (let cStereotype of stereotypePoolCompare) {
            if (cStereotype.name === stereotype.name) {
                stereotypeCompare = cStereotype;
            }
        }
        if (stereotypeCompare === undefined) {
            errors.push(Locale.errorStereotypeNotFoundOrIncorrect + " " + stereotype.name + " " + Locale.errorInExternalMetamodel);
            continue;
        }
        if (stereotypeCompare.iri !== stereotype.iri || stereotypeCompare.description !== stereotype.description || stereotypeCompare.source !== stereotype.source) {
            errors.push(Locale.errorStereotypeNotFoundOrIncorrect + " " + stereotype.name + " " + Locale.errorInExternalMetamodel);
        }
    }

    return errors;

}

export function validateSettingsWithCurrentSettings(source: string) {
    let compareArray = fetchSettings(source);

    let errors = [];

    if (!compareArray) {
        errors.push(Locale.errorImport);
        return errors;
    }
    for (let item of compareArray) {
        if (item.type !== undefined) {
            switch (item.type) {
                case "Stereotype":
                    let compareStereotype = new SourceData(item.name, item.annotations[0].value[0], item.annotations[1].value[0],item.annotations[2].value[0])
                    if (!(StereotypePool.includes(compareStereotype))) {
                        errors.push(Locale.errorStereotypeSourceNotFound + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    }
                    break;
                case "Relationship":
                    let linkEnd = item.annotations[0].value[0];
                    let labeled = Helper.convertStringToBoolean(item.annotations[1].value[0]);
                    let dashed = Helper.convertStringToBoolean(item.annotations[2].value[0]);
                    let iriRel = item.annotations[item.annotations.length-3].value[0];
                    let description = item.annotations[item.annotations.length-2].value[0];
                    let source = item.annotations[item.annotations.length-1].value[0];
                    if (!(item.name) in LinkPool) {
                        errors.push(Locale.errorRelationshipNameNotFound + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    } else if (linkEnd !== LinkPool[item.name][0]
                        || labeled !== LinkPool[item.name][1]
                        || dashed !== LinkPool[item.name][2]
                        || iriRel !== LinkPool[item.name][4]
                        || description !== LinkPool[item.name][5]
                        || source !== LinkPool[item.name][6]) {
                        errors.push(Locale.errorRelationshipWrongVisualSettings + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    } else if ((item.annotations.length - 3) !== LinkPool[item.name][3].length) {
                        errors.push(Locale.errorWrongNumberOfOCLConstraints + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    } else {
                        for (let i = 3; i < item.annotations.length - 3; i++) {
                            if (item.annotations[i].value[0] !== LinkPool[item.name][3][i - 3].statement) {
                                errors.push(Locale.errorWrongOCLConstraint + " " + item.name + " " + Locale.errorInExternalMetamodel);
                            }
                        }
                    }
                    break;
                case "AttributeType":
                    let iriAttr = item.annotations[0].value[0];
                    if (((String(iriAttr) in AttributeTypePool))) {
                        if (AttributeTypePool[iriAttr] === item.name){
                            break;
                        }
                    }
                    errors.push(Locale.errorAttributeTypeNotFound + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    break;
                case "Cardinality":
                    for (let cardinality of CardinalityPool){
                        if (cardinality.toString() === item.name){
                            break;
                        }
                    }
                    errors.push(Locale.errorCardinalityNotFound + " " + item.name + " " + Locale.errorInExternalMetamodel);
                    break;
                case "Language":
                    if (!((item.annotations[0].value[0]) in LanguagePool))
                        errors.push(Locale.errorLanguageNotFound + " " + item.type + " " + Locale.errorInExternalMetamodel);
                    break;
                default:
                    errors.push(Locale.errorUnknownType + " " + item.type + " " + Locale.errorInExternalMetamodel);
            }
        }
    }
    return errors;
}

export function validateCurrent(model: OntoDiagramModel) {
    let linkPool = [];
    let stereotypePool = [];
    let attributeTypePool = [];
    let languagePool = [];
    let cardinalityPool = [];

    let nodes = model.getNodes();
    let links = model.getLinks();


    for (let node in nodes) {
        let nodeData = {
            stereotype: nodes[node].stereotype
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
            iri: links[link].iri,
            description: links[link].description,
            source: links[link].source
        };
        if (!linkPool.includes(linkData)) {
            linkPool.push(linkData);
        }
    }


    let errors = [];

    for (let link of linkPool) {
        let array = [link.linkEnd, link.labeled, link.dashed];
        for (let i = 0; i < array.length; i++) {
            if (LinkPool[link.name][i] !== array[i]) {
                errors.push(Locale.errorRelationshipNotFoundOrIncorrect + " " + link.name + " " + Locale.inCurrentSettings);
            }
        }
        if (LinkPool[link.name][3].length !== link.OCL.length) {
            errors.push(Locale.errorWrongNumberOfOCLConstraints + " " + link.name + " " + Locale.inCurrentSettings);
            continue;
        }
        for (let i = 0; i < LinkPool[link.name][3].length; i++) {
            if (LinkPool[link.name][3][i] !== link.OCL[i]) {
                errors.push(Locale.errorWrongOCLConstraint + " " + link.name + " " + Locale.inCurrentSettings);
                break;
            }
        }
        if (LinkPool[link.name][4] !== link.iri || LinkPool[link.name][5] !== link.description || LinkPool[link.name][6] !== link.source) {
            errors.push(Locale.errorRelationshipNotFoundOrIncorrect + " " + link.name + " " + Locale.inCurrentSettings);
        }

    }

    for (let stereotype of stereotypePool) {
        if (StereotypePool.includes(stereotype)) {
            errors.push(Locale.errorStereotypeNotFoundOrIncorrect + " " + stereotype.name + " " + Locale.inCurrentSettings);
        }
    }

    for (let attributeType of Object.keys(attributeTypePool)) {
        if (!Object.keys(AttributeTypePool).includes(attributeType)) {
            errors.push(Locale.errorAttributeTypeNotFound + " " + attributeType + " " + Locale.inCurrentSettings);
        }
    }

    for (let language of languagePool) {
        if (!Object.keys(LanguagePool).includes(language)) {
            errors.push(Locale.errorLanguageNotFound + " " + language + " " + Locale.inCurrentSettings);
        }
    }

    for (let cardinality of cardinalityPool) {
        if (!CardinalityPool.includes(cardinality)) {
            errors.push(Locale.errorCardinalityNotFound + " " + cardinality.toString() + " " + Locale.inCurrentSettings);
        }
    }

    return errors;
}