import { Instance, Patterns } from "./PatternTypes";

export function produceOttrPattern(pattern: string) {
  const ret = [
    `<${pattern}> a ottr:Pattern.`,
    `<${pattern}> skos:prefLabel "${Patterns[pattern].title}".`,
    `<${pattern}> dc:creator "${Patterns[pattern].author}".`,
    `<${pattern}> pav:createdOn "${Patterns[pattern].date}"^xsd:dateTime.`,
    `<${pattern}> dc:description "${Patterns[pattern].description}".`,
    // ...Patterns[pattern].
  ].join("");
}
export function produceInstance(instance: Instance): string[] {
  const queries: string[] = [];

  return queries;
}
