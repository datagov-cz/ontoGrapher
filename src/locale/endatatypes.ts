export const enDatatypes: { [key: string]: string } = {
  "http://www.w3.org/2001/XMLSchema#boolean": "Boolean",
  "http://www.w3.org/2001/XMLSchema#date": "Date",
  "http://www.w3.org/2001/XMLSchema#time": "Time",
  "http://www.w3.org/2001/XMLSchema#datetime": "Date and time",
  "http://www.w3.org/2001/XMLSchema#integer": "Integer",
  "http://www.w3.org/2001/XMLSchema#decimal": "Decimal number",
  "http://www.w3.org/2001/XMLSchema#anyURI": "IRI",
  "http://www.w3.org/2001/XMLSchema#string": "String",
  "https://ofn.gov.cz/základní-datové-typy/2020-07-01/#text": "Text",
} as const;
