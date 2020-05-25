import {Restrictions} from "../config/Restrictions";
import * as Locale from "../locale/LocaleMain.json";

export class RestrictionObject {
	public onProperty: string;
	public restriction: string;
	public target: string;

	constructor(restriction: string, onProperty: string, target: string, init: boolean = false, id?: string) {
		if (restriction in Restrictions) {
			this.onProperty = onProperty;
			this.restriction = restriction;
			this.target = target;
			if (init && id) Restrictions[restriction].init(id, this);
		} else throw new Error(Locale.errorMissingRestriction)
	}

	initRestriction(iri: string) {
		Restrictions[this.restriction].init(iri, this);
	}

	saveRestriction(iriTarget: string) {
		Restrictions[this.restriction].save(this, iriTarget);
	}
}