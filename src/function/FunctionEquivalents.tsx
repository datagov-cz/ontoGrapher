import { EquivalentClasses } from "../config/Variables";

export function isEquivalent(iri: string, equivalent: string): boolean {
  return (
    iri in EquivalentClasses && EquivalentClasses[iri].includes(equivalent)
  );
}

export function filterEquivalent(arr: string[], iri: string): boolean {
  return !!arr.find((i) => i === iri || isEquivalent(iri, i));
}

export function getEquivalents(iri: string): string[] {
  return iri in EquivalentClasses ? [...EquivalentClasses[iri], iri] : [iri];
}
