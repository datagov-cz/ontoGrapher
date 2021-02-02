import {Restriction} from "../datatypes/Restriction";
import {ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "./Variables";
import {parsePrefix} from "../function/FunctionEditVars";
import {addLink} from "../function/FunctionCreateVars";
import {getNewLink} from "../function/FunctionGetVars";
import {LinkType} from "./Enum";
import {Cardinality} from "../datatypes/Cardinality";

export var RestrictionConfig: {
	[key: string]: (iri: string, restriction: Restriction) => string | void
} = {};

RestrictionConfig["http://www.w3.org/2002/07/owl#someValuesFrom"] = (iri, restriction) => {
	return createConnection(iri, restriction, parsePrefix("owl", "allValuesFrom"));
}

RestrictionConfig["http://www.w3.org/2002/07/owl#allValuesFrom"] = (iri, restriction) => {
	return createConnection(iri, restriction, parsePrefix("owl", "someValuesFrom"));
}

RestrictionConfig["http://www.w3.org/2002/07/owl#minQualifiedCardinality"] = (iri, restriction) => {
	createCardinality(iri, restriction);
}

RestrictionConfig["http://www.w3.org/2002/07/owl#maxQualifiedCardinality"] = (iri, restriction) => {
	createCardinality(iri, restriction);
}

function createConnection(iri: string, restriction: Restriction, pred: string) {
	if (VocabularyElements[iri].restrictions.find(r => r.restriction === pred
		&& r.onProperty === restriction.onProperty && r.target === restriction.target)) {
		let id = Object.keys(ProjectElements).find(elem => ProjectElements[elem].iri === iri);
		let target = Object.keys(ProjectElements).find(elem => ProjectElements[elem].iri === restriction.target);
		if (id && target && !(ProjectElements[id].connections.find(conn =>
			ProjectLinks[conn].iri === restriction.onProperty &&
			ProjectLinks[conn].target === target))) {
			let link = getNewLink(LinkType.DEFAULT);
			let linkID = link.id as string;
			addLink(linkID, restriction.onProperty, id, target);
			ProjectElements[id].connections.push(linkID);
			return linkID;
		}
	}
}

function createCardinality(iri: string, restriction: Restriction) {
	let elemID = Object.keys(ProjectElements).find(elem => ProjectElements[elem].iri === iri) || "";
	if (elemID !== "" && restriction.target !== "" && restriction.onClass) {
		let linkID = Object.keys(ProjectLinks).find(link => ProjectElements[elemID].connections.includes(link) &&
			ProjectLinks[link].active && ProjectLinks[link].iri === restriction.onProperty &&
			restriction.onClass === ProjectElements[ProjectLinks[link].target].iri);
		if (linkID) {
			let pos = restriction.restriction.includes("max");
			ProjectLinks[linkID].targetCardinality = pos ? new Cardinality(
				ProjectLinks[linkID].targetCardinality.getFirstCardinality() || ProjectSettings.defaultCardinality.getFirstCardinality(),
				restriction.target) :
				new Cardinality(
					restriction.target,
					ProjectLinks[linkID].targetCardinality.getSecondCardinality() || ProjectSettings.defaultCardinality.getSecondCardinality());
		}
	}
}