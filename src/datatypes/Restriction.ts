import {RestrictionConfig} from "../config/RestrictionConfig";

export class Restriction {
	public onProperty: string;
	public restriction: string;
	public target: string;
	public onClass?: string;

	constructor(restriction: string, onProperty: string, target: string, onClass?: string) {
		this.onProperty = onProperty;
		this.restriction = restriction;
		this.target = target;
		if (onClass) this.onClass = onClass;
	}

	initRestriction(iri: string) {
		if (this.restriction in RestrictionConfig) {
			return RestrictionConfig[this.restriction](iri, this);
		}
	}

	compare(other: Restriction) {
		return this.target === other.target
			&& this.restriction === other.restriction
			&& this.onProperty === other.onProperty
			&& this.onClass === other.onClass
	}
}