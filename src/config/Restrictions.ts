import {parsePrefix} from "../function/FunctionEditVars";
import {RestrictionObject} from "../datatypes/RestrictionObject";
import {VocabularyElements} from "./Variables";

export var Restrictions: {
	[key: string]: {
		init: (iri: string, restriction: RestrictionObject) => void;
		check: (id: string) => boolean,
		save: (restriction: RestrictionObject, target?: string) => void,
	}
} = {};

// source -[mvp1]-> target
// source -[mvp2]-> target2
// target d -[source]- r target2

let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";

Restrictions["http://www.w3.org/2002/07/owl#someValuesFrom"] = {
	init: (iri, restriction) => {
		if (restriction.onProperty === mvp2IRI) {
			for (let rest of VocabularyElements[iri].restrictions) {
				if (rest.onProperty === mvp2IRI && rest.restriction === parsePrefix("owl", "allValuesFrom")) {
					VocabularyElements[iri].range = restriction.target;
					break;
				}
			}
		}
		if (restriction.onProperty === mvp1IRI) {
			for (let rest of VocabularyElements[iri].restrictions) {
				if (rest.onProperty === mvp1IRI && rest.restriction === parsePrefix("owl", "allValuesFrom")) {
					VocabularyElements[iri].domain = restriction.target;
					if (VocabularyElements[restriction.target]) {
						VocabularyElements[restriction.target].domainOf.push(iri);
					}
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

Restrictions["http://www.w3.org/2002/07/owl#allValuesFrom"] = {
	init: (iri, restriction) => {
		let mvp2IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-2";
		if (restriction.onProperty === mvp2IRI) {
			for (let rest of VocabularyElements[iri].restrictions) {
				if (rest.onProperty === mvp2IRI && rest.restriction === parsePrefix("owl", "someValuesFrom")) {
					VocabularyElements[iri].range = restriction.target;
					break;
				}
			}
		}
		let mvp1IRI = "https://slovník.gov.cz/základní/pojem/má-vztažený-prvek-1";
		if (restriction.onProperty === mvp1IRI) {
			for (let rest of VocabularyElements[iri].restrictions) {
				if (rest.onProperty === mvp1IRI && rest.restriction === parsePrefix("owl", "someValuesFrom")) {
					VocabularyElements[iri].domain = restriction.target;
					if (VocabularyElements[restriction.target]) {
						VocabularyElements[restriction.target].domainOf.push(iri);
					}
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