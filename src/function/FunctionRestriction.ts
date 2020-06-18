import {Restrictions} from "../config/Restrictions";
import {ProjectElements, ProjectLinks, VocabularyElements} from "../config/Variables";
import {RestrictionObject} from "../datatypes/RestrictionObject";
import {parsePrefix} from "./FunctionEditVars";

export function createRestriction(iri: string, restriction: string, onProperty: string, target: { type: string, value: string }) {
	if (target.type !== "bnode" && (restriction in Restrictions)) {
		let newRestriction = new RestrictionObject(restriction, onProperty, target.value);
		for (let rest of VocabularyElements[iri].restrictions) {
			if (rest.target === newRestriction.target
				&& rest.restriction === newRestriction.restriction
				&& rest.onProperty === newRestriction.onProperty) {
				return;
			}
		}
		VocabularyElements[iri].restrictions.push(newRestriction);
	}
}

export function initRestrictions() {
	for (let iri in VocabularyElements) {
		for (let restriction of VocabularyElements[iri].restrictions) {
			restriction.initRestriction(iri);
		}
	}
}

export function getRestrictionsAsJSON(iri: string) {
	let result: {}[] = [];
	for (let restriction of VocabularyElements[iri].restrictions) {
		for (let id in ProjectLinks) {
			if (ProjectLinks[id].iri === iri && ProjectElements[ProjectLinks[id].source].iri
			) {
				restriction.saveRestriction(ProjectElements[ProjectLinks[id].source].iri);
				break;
			}
		}
		let i = VocabularyElements[iri].restrictions.indexOf(restriction);
		result.push({
			"@id": iri + "/restriction-" + (i + 1),
			"@type": parsePrefix("owl", "Restriction"),
			[parsePrefix("owl", "onProperty")]: restriction.onProperty,
			[restriction.restriction]: restriction.target
		})
	}
	return result;
}