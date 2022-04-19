import Pattern from "./Pattern";

export default class Instance {
  public pattern: Pattern;
  public values: Set<string>;

  constructor(pattern: Pattern, values: Set<string>) {
    this.pattern = pattern;
    this.values = values;
  }
}
