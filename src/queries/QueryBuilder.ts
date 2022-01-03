import { Prefixes } from "../config/Variables";

let count: number = 0;

export const qb: {
  g: (context: string, statements: string[]) => string;
  gs: (contexts: string[], statements: string[]) => string;
  b: (strings: string[]) => string;
  po: (p: string, o: string) => string;
  v: (name?: string) => string;
  ll: (label: string | boolean | number, lang?: string) => string;
  lt: (label: string | boolean | number, type?: string) => string;
  i: (iri: string) => string;
  p: (prefix: string, i: string) => string;
  a: (strings: string[]) => string;
  s: (s: string, p: string, o: string, option?: boolean) => string;
  constructQuery: (...queries: string[]) => string;
  combineQueries: (...queries: string[]) => string;
} = {
  gs(contexts: string[], statements: string[]): string {
    return `graph ?graphs {
${statements.join(`
`)}
}
values ?graphs {<${contexts.filter((c) => c).join("> <")}>}`;
  },
  g: (context: string, statements: string[]) => {
    return `graph <${context}> {
${statements.join(`
`)}
}`;
  },
  //blank
  b: (strings: string[]) => {
    return `[${strings.join(`;
		`)}]`;
  },
  //variable
  v: (name?: string) => {
    return name ? `?${name}` : `?var${count++}`;
  },
  //literal with language
  ll: (literal: string | boolean | number, lang?: string) => {
    return `"${
      typeof literal === "string"
        ? literal.replace(/(["'\\])/g, "\\$1").replace(/[\n\r]/g, " ")
        : literal
    }"${lang ? `@${lang}` : ""}`;
  },
  //literal with type
  lt: (literal: string | boolean | number, type?: string) => {
    return `"${
      typeof literal === "string"
        ? literal.replace(/(["'\\])/g, "\\$1").replace(/[\n\r]/g, " ")
        : literal
    }"${type ? `^^${type}` : ""}`;
  },
  //iri
  i: (iri: string) => {
    return `<${iri}>`;
  },
  //prefix parsing
  p: (prefix: string, i: string) => {
    return qb.i(`${Prefixes[prefix]}${i}`);
  },
  //array
  a: (strings: string[]) => {
    return strings.join(`, `);
  },
  //statement
  s: (s: string, p: string, o: string, option: boolean = true) => {
    return `${option ? `${s} ${p} ${o}.` : ""}`;
  },
  //statement (blank)
  po: (p: string, o: string, option: boolean = true) => {
    return `${option ? `${p} ${o}` : ""}`;
  },
  constructQuery: (...queries) => {
    let filter = queries.filter((query) => query);
    let result = Object.keys(Prefixes)
      .map(
        (prefix) =>
          `PREFIX ${prefix}: <${Prefixes[prefix]}> 
`
      )
      .join(``);
    count = 0;
    return filter.length > 0
      ? result.concat(
          filter.join(`;
`)
        )
      : "";
  },
  combineQueries: (...queries) => {
    return queries.filter((q) => q).join(`;
`);
  },
};
