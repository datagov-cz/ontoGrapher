import { enDatatypes } from "./endatatypes";

export const csDatatypes: { [Property in keyof typeof enDatatypes]: string } = {
  "http://www.w3.org/2001/XMLSchema#boolean": "Ano či ne",
  "http://www.w3.org/2001/XMLSchema#date": "Datum",
  "http://www.w3.org/2001/XMLSchema#time": "Čas",
  "http://www.w3.org/2001/XMLSchema#datetime": "Datum a čas",
  "http://www.w3.org/2001/XMLSchema#integer": "Celé číslo",
  "http://www.w3.org/2001/XMLSchema#decimal": "Desetinné číslo",
  "http://www.w3.org/2001/XMLSchema#anyURI": "IRI",
  "http://www.w3.org/2001/XMLSchema#string": "Řetězec",
  "https://ofn.gov.cz/základní-datové-typy/2020-07-01/#text": "Text",
} as const;
