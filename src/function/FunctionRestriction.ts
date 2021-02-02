import {ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {Restriction} from "../datatypes/Restriction";
import {getNewLink} from "./FunctionGetVars";
import {LinkType} from "../config/Enum";
import {addLink} from "./FunctionCreateVars";

export function createRestriction(obj: { [key: string]: any }, iri: string, restriction: string, onProperty: string, target: { type: string, value: string }, onClass?: string) {
	if (target.type !== "bnode") {
		let newRestriction = new Restriction(restriction, onProperty, target.value, onClass);
		for (let rest of obj[iri].restrictions) {
			if (rest.target === newRestriction.target
				&& rest.restriction === newRestriction.restriction
				&& rest.onProperty === newRestriction.onProperty
				&& rest.onClass === newRestriction.onClass) {
				return;
			}
		}
		obj[iri].restrictions.push(newRestriction);
		obj[iri].restrictions.sort((a: Restriction, b: Restriction) => a.restriction.localeCompare(b.restriction));
	}
}

export function initConnections(): string[] {
	let linksToPush = [];
	for (let iri in VocabularyElements) {
		for (let restriction of VocabularyElements[iri].restrictions) {
			let newLink = restriction.initRestriction(iri);
			if (newLink) linksToPush.push(newLink);
		}

		for (let subClassOf of VocabularyElements[iri].subClassOf) {
			if (subClassOf in VocabularyElements) {
				let domainID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === iri);
				let rangeID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === subClassOf);
				if (domainID && rangeID && !(ProjectElements[domainID].connections.find(conn =>
					ProjectElements[ProjectLinks[conn].target].iri === subClassOf))) {
					let linkGeneralization = getNewLink(LinkType.GENERALIZATION);
					let id = linkGeneralization.id as string;
					addLink(id, ProjectSettings.ontographerContext + "/uml/generalization", domainID, rangeID, LinkType.GENERALIZATION);
					ProjectElements[domainID].connections.push(id);
					linksToPush.push(id);
				}
			}
		}
	}
	return linksToPush;
}