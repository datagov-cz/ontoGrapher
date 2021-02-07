import {Restriction} from "../datatypes/Restriction";
import {ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "./Variables";
import {parsePrefix} from "../function/FunctionEditVars";
import {addLink} from "../function/FunctionCreateVars";
import {getElemFromIRI, getNewLink} from "../function/FunctionGetVars";
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
		const id = getElemFromIRI(iri);
		const target = getElemFromIRI(restriction.target);
		if (id && target && !(ProjectElements[id].connections.find(conn =>
			ProjectLinks[conn].iri === restriction.onProperty &&
			ProjectLinks[conn].target === target))) {
			const link = getNewLink(LinkType.DEFAULT);
			const linkID = link.id as string;
			addLink(linkID, restriction.onProperty, id, target);
			ProjectElements[id].connections.push(linkID);
			return linkID;
		}
	}
}

function createCardinality(iri: string, restriction: Restriction) {
	const elemID = getElemFromIRI(iri) || "";
	if (elemID !== "" && restriction.target !== "" && restriction.onClass) {
		const linkID = Object.keys(ProjectLinks).find(link => ProjectElements[elemID].connections.includes(link) &&
			ProjectLinks[link].active && ProjectLinks[link].iri === restriction.onProperty &&
			restriction.onClass === ProjectElements[ProjectLinks[link].target].iri);
		if (linkID) {
			const pos = restriction.restriction.includes("max");
			ProjectLinks[linkID].targetCardinality = pos ? new Cardinality(
				ProjectLinks[linkID].targetCardinality.getFirstCardinality() || ProjectSettings.defaultCardinality.getFirstCardinality(),
				restriction.target) :
				new Cardinality(
					restriction.target,
					ProjectLinks[linkID].targetCardinality.getSecondCardinality() || ProjectSettings.defaultCardinality.getSecondCardinality());
		}
	}
}