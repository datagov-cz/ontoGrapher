import { RestrictionConfig } from "../config/logic/RestrictionConfig";

export class Restriction {
  public source: string;
  public onProperty: string;
  public restriction: string;
  public target: string;
  public onClass?: string;
  public inverse: boolean;

  constructor(
    source: string,
    restriction: string,
    onProperty: string,
    target: string,
    onClass?: string,
    inverse: boolean = false
  ) {
    this.source = inverse && onClass ? onClass : source;
    this.onProperty = onProperty;
    this.restriction = restriction;
    this.target = target;
    if (onClass) this.onClass = inverse ? source : onClass;
    this.inverse = inverse;
  }

  initRestriction(iri: string) {
    if (this.restriction in RestrictionConfig) {
      return RestrictionConfig[this.restriction](iri, this);
    }
  }

  compare(other: Restriction) {
    return (
      this.source === other.source &&
      this.target === other.target &&
      this.restriction === other.restriction &&
      this.onProperty === other.onProperty &&
      this.onClass === other.onClass &&
      this.inverse === other.inverse
    );
  }
}
