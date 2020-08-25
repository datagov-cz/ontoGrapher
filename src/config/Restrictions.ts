import {parsePrefix} from "../function/FunctionEditVars";
import {RestrictionObject} from "../datatypes/RestrictionObject";
import {VocabularyElements} from "./Variables";
import {ConnectionObject} from "../datatypes/ConnectionObject";

export var Restrictions: {
	[key: string]: {
		init: (iri: string, restriction: RestrictionObject) => void;
		check: (id: string) => boolean,
		save: (restriction: RestrictionObject, target?: string) => void,
	}
} = {};

let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";

Restrictions["http://www.w3.org/2002/07/owl#someValuesFrom"] = {
	init: (iri, restriction) => {
		if (restriction.onProperty === mvp2IRI) {
			for (let rest of VocabularyElements[iri].restrictions) {
				if (rest.onProperty === mvp2IRI && rest.restriction === parsePrefix("owl", "allValuesFrom") && rest.target === restriction.target) {
					VocabularyElements[iri].range = restriction.target;
					if (restriction.target in VocabularyElements && VocabularyElements[iri].domain) {
						const domain = VocabularyElements[iri].domain;
						if (domain) VocabularyElements[domain].connections.push(new ConnectionObject(iri, restriction.target, false));
					}
					break;
				}
			}
		} else if (restriction.onProperty === mvp1IRI) {
			for (let rest of VocabularyElements[iri].restrictions) {
				if (rest.onProperty === mvp1IRI && rest.restriction === parsePrefix("owl", "allValuesFrom") && rest.target === restriction.target) {
					VocabularyElements[iri].domain = restriction.target;
					break;
				}
			}
		} else {
			for (let rest of VocabularyElements[iri].restrictions) {
				if (rest.onProperty === restriction.onProperty && rest.restriction === parsePrefix("owl", "allValuesFrom") && rest.target === restriction.target) {
					VocabularyElements[iri].connections.push(new ConnectionObject(restriction.onProperty, restriction.target));
				}
			}
		}
	},
	check: () => true,
	save: (restriction, target) => {
		if (target && (restriction.onProperty === mvp1IRI || restriction.onProperty === mvp2IRI)) restriction.target = target;
	}
}

Restrictions["http://www.w3.org/2002/07/owl#allValuesFrom"] = {
	init: (iri, restriction) => {
		let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";
		if (restriction.onProperty === mvp2IRI) {
			for (let rest of VocabularyElements[iri].restrictions) {
				if (rest.onProperty === mvp2IRI && rest.restriction === parsePrefix("owl", "someValuesFrom") && rest.target === restriction.target) {
					VocabularyElements[iri].range = restriction.target;
					if (restriction.target in VocabularyElements && VocabularyElements[iri].domain) {
						const domain = VocabularyElements[iri].domain;
						if (domain) VocabularyElements[domain].connections.push(new ConnectionObject(iri, restriction.target, false));
					}
					break;
				}
			}
		}
		let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
		if (restriction.onProperty === mvp1IRI) {
			for (let rest of VocabularyElements[iri].restrictions) {
				if (rest.onProperty === mvp1IRI && rest.restriction === parsePrefix("owl", "someValuesFrom") && rest.target === restriction.target) {
					VocabularyElements[iri].domain = restriction.target;
					break;
				}
			}
		}
	},
	check: () => true,
	save: (restriction, target) => {
		if (target && (restriction.onProperty === mvp1IRI || restriction.onProperty === mvp2IRI)) restriction.target = target;
	}
}