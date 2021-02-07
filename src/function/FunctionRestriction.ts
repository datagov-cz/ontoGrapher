import {ProjectElements, ProjectLinks, ProjectSettings, VocabularyElements} from "../config/Variables";
import {Restriction} from "../datatypes/Restriction";
import {getElemFromIRI, getNewLink} from "./FunctionGetVars";
import {LinkType} from "../config/Enum";
import {addLink} from "./FunctionCreateVars";

export function createRestriction(restrictions: Restriction[], iri: string, restriction: string, onProperty: string, target: { type: string, value: string }, onClass?: string) {
	if (target.type !== "bnode") {
		const newRestriction = new Restriction(restriction, onProperty, target.value, onClass);
		for (const rest of restrictions) {
			if (rest.compare(newRestriction)) {
				return;
			}
		}
		restrictions.push(newRestriction);
		restrictions.sort((a: Restriction, b: Restriction) => a.restriction.localeCompare(b.restriction));
	}
}

export function initConnections(): string[] {
	const linksToPush = [];
	for (const iri in VocabularyElements) {
		for (const restriction of VocabularyElements[iri].restrictions) {
			const newLink = restriction.initRestriction(iri);
			if (newLink) linksToPush.push(newLink);
		}

		for (const subClassOf of VocabularyElements[iri].subClassOf) {
			if (subClassOf in VocabularyElements) {
				const domainID = getElemFromIRI(iri);
				const rangeID = Object.keys(ProjectElements).find(element => ProjectElements[element].iri === subClassOf);
				if (domainID && rangeID && !(ProjectElements[domainID].connections.find(conn =>
					ProjectElements[ProjectLinks[conn].target].iri === subClassOf))) {
					let linkGeneralization = getNewLink(LinkType.GENERALIZATION);
					const id = linkGeneralization.id as string;
					addLink(id, ProjectSettings.ontographerContext + "/uml/generalization", domainID, rangeID, LinkType.GENERALIZATION);
					ProjectElements[domainID].connections.push(id);
					linksToPush.push(id);
				}
			}
		}
	}
	return linksToPush;
}