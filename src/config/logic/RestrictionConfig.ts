import {Restriction} from "../../datatypes/Restriction";
import {ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../Variables";
import {parsePrefix} from "../../function/FunctionEditVars";
import {addLink} from "../../function/FunctionCreateVars";
import {getDefaultCardinality, getElemFromIRI, getNewLink} from "../../function/FunctionGetVars";
import {LinkType} from "../Enum";
import {Cardinality} from "../../datatypes/Cardinality";
import _ from "underscore";

export const RestrictionConfig: {
	[key: string]: (iri: string, restriction: Restriction) => string | void
} = {
	"http://www.w3.org/2002/07/owl#someValuesFrom": (iri: string, restriction: Restriction) =>
		createConnection(iri, restriction, parsePrefix("owl", "allValuesFrom")),
	"http://www.w3.org/2002/07/owl#allValuesFrom": (iri: string, restriction: Restriction) =>
		createConnection(iri, restriction, parsePrefix("owl", "someValuesFrom")),
	"http://www.w3.org/2002/07/owl#minQualifiedCardinality": (iri: string, restriction: Restriction) =>
		createCardinality(iri, restriction),
	"http://www.w3.org/2002/07/owl#maxQualifiedCardinality": (iri: string, restriction: Restriction) =>
		createCardinality(iri, restriction),

} as const;

function createConnection(iri: string, restriction: Restriction, pred: string) {
	if (_.find(VocabularyElements[iri].restrictions, {
		restriction: pred,
		onProperty: restriction.onProperty,
		target: restriction.target
	})) {
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
				ProjectLinks[linkID].targetCardinality.getFirstCardinality() || ProjectSettings.defaultCardinality1,
				restriction.target) :
				new Cardinality(
					restriction.target,
					ProjectLinks[linkID].targetCardinality.getSecondCardinality() || ProjectSettings.defaultCardinality2);
			if (!(ProjectLinks[linkID].targetCardinality).checkCardinalities()) ProjectLinks[linkID].targetCardinality = getDefaultCardinality();
		}
	}
}
