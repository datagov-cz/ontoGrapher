import {Restrictions} from "../config/Restrictions";
import {ProjectElements, ProjectLinks, VocabularyElements} from "../config/Variables";
import {RestrictionObject} from "../datatypes/RestrictionObject";
import {parsePrefix} from "./FunctionEditVars";
import {ConnectionObject} from "../datatypes/ConnectionObject";

export function createRestriction(obj: { [key: string]: any }, iri: string, restriction: string, onProperty: string, target: { type: string, value: string }) {
	if (target.type !== "bnode" && (restriction in Restrictions)) {
		let newRestriction = new RestrictionObject(restriction, onProperty, target.value);
		for (let rest of obj[iri].restrictions) {
			if (rest.target === newRestriction.target
				&& rest.restriction === newRestriction.restriction
				&& rest.onProperty === newRestriction.onProperty) {
				return;
			}
		}
		obj[iri].restrictions.push(newRestriction);
	}
}

export function initRestrictions() {
	for (let iri in VocabularyElements) {
		for (let restriction of VocabularyElements[iri].restrictions) {
			restriction.initRestriction(iri);
		}
		let domain = VocabularyElements[iri].domain;
		let range = VocabularyElements[iri].range;
		if (typeof domain === "string" && typeof range === "string" && VocabularyElements[domain]) {
			VocabularyElements[domain].connections.push(new ConnectionObject(iri, range, false));
		}
	}
}

export function initConnections() {
	for (let iri in VocabularyElements) {
		for (let connection of VocabularyElements[iri].connections) {
			connection.initConnection(iri);
		}
	}
}

export function getRestrictionsAsJSON(iri: string) {
	let result: {}[] = [];
	for (let restriction of VocabularyElements[iri].restrictions) {
		for (let id in ProjectLinks) {
			if (ProjectLinks[id].iri === iri && ProjectElements[ProjectLinks[id].source].iri) {
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